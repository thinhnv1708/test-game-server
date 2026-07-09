# Flow chính

- Client req -> http server -> kafka partition -> consumer xử lý message, trừ máu boss, tính điểm đóng góp, consumer offset và lưu lại vào memory cho tốc độ tối đa.

- Mỗi message sẽ có 1 offset, lưu offset lại để tiện cho việc replay mỗi khi server bị resart.

- Snapshot task lấy dữ liệu từ memory lưu lại vào DB 5 giây 1 lần. Việc lưu dữ liệu gồm thông tin boss, thông tin đóng góp của người chơi, consumer offset sẽ được lưu atomic.

- Khi server bật, sẽ thực hiện việc warmup, dữ liệu sẽ được load từ db đẩy vào memory, offset của consumer cũng sẽ được lấy lại từ lần snapshot cuối cùng và nạp vào consumer.

# Data Strategy:

- Database: Chọn postgres vì dữ liệu boss, contribution hay dữ liệu để lưu trữ trạng thái claim đều là dữ liệu có cấu trúc cố định, rõ ràng và có mối quan hệ chặt chẽ (boss_id, player_id)

- Cache: Vì rất nhiều req và tính chất realtime nên chọn memory, giảm tối đa độ trễ vì không thông qua network.

- Mq: Vì đề bài yêu cầu không được mất dữ liệu nếu server bị restart. Nếu chỉ thực hiện snapshot X giây 1 lần thì sẽ bị mất dữ liệu trong khoảng thời gian từ lúc snapshot cuối cùng đến lúc server restart. Tôi chọn Kafka, kafka có offset, rất tiện cho việc consumer replay lại dữ liệu. Hơn nữa tốc độ của kafka trên tài liệu có thể xử lý được hàng triệu message / giây, rất nhanh.

# Concurrency & Safety:

- Api này sẽ lấy dữ liệu boss và dữ liệu đánh dấu người dùng đã claime ở database, thực hiện atomic để đảm bảo xử lý chính xác 1 lần.

- Ngoài ra còn có các cơ chế khác như sử dụng distributed-lock nếu service là distributed-service. Các kỹ thuật khác như CAS.

# Assumptions & Trade-offs:

- Nếu có thêm thời gian tôi sẽ cải tiến thêm:
  - Có thể tách api nhận req damage thành service riêng để scale. Thực hiện batch send khi đẩy message vào kafka tránh đấy nhiều message nhỏ lẽ như hiện tại.
  - Có thể tối ưu thêm việc quản lý cache, thêm ttl, chủ động dọn rác nếu dữ liệu không cần dùng nữa. Ví dụ như boss đã chết, xoá boss và những điểm đóng góp của người chơi ra khỏi cache.
- Các giải pháp tôi đã nghĩ đến
  - Không sử dụng replay, chỉ snapshot: nhưng lại không phù hợp với đề bài là không được mất dữ liệu
  - Sử dụng việc ghi log damage ra file (clear file mỗi lần snapshot thành công) để replay đỡ phải cài thêm kafka. Nhưng cũng không đảm bảo việc server chết đột ngột

# Cơ chế hoạt động của các Api khác

- Leaderboad: Sử dụng snapshot 3 giây 1 lần để lọc ra 10 người chơi cao điểm nhất đối với mỗi boss và lưu lại vào memory. Api GET /boss/:boss_id req đến chỉ lấy ở memory và trả về.

# Cách dùng:

- Bước 1: Tạo file .env, copy toàn bộ nội dung từ .env.example vào .env
- Bước 2: Chạy lệnh docker compose --env-file .env up -d để start server.
- Sau khi server được khởi chạy, có các api như sau:
  - [POST] http://localhost:3000/damage
    Body:
    ```json
    {
      "boss_id": "boss_1",
      "player_id": "player_1",
      "damage": 100
    }
    ```
  - [GET] http://localhost:3000/boss/:bossId
    - Lấy danh sách bảng xếp hạng (Leaderboard) gồm 10 người chơi đóng góp sát thương lớn nhất cho Boss theo ID từ cache.
    - Ví dụ: `http://localhost:3000/boss/boss_1`
  - [POST] http://localhost:3000/rewards/claim
    - Nhận phần thưởng sau khi tiêu diệt boss (HP = 0), dựa trên tỷ lệ sát thương đóng góp.
    - Điểm thưởng sẽ là % sát thương gây lên boss nhân 1000 và làm tròn xuống.
    - Body:
    ```json
    {
      "boss_id": "boss_1",
      "player_id": "player_1"
    }
    ```
