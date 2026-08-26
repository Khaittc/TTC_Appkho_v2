# ARCHITECTURE

## Web Demo hiện tại
App hiện tại chạy trong chế độ Demo trên nền tảng Web (React/Vite). Dữ liệu được mock và lưu trong browser storage (sessionStorage hoặc localStorage), đi qua interface DataProvider.

## Shared React/Vite core
Tất cả UI components, domain types, business services, và DataProvider interfaces được xây dựng chung cho cả Web và Desktop.

## Firebase/Cloud production backend trong tương lai
Sẽ dùng Firebase Authentication và Firestore, cùng với Cloud Functions/Run API để xử lý bảo mật cho bản production.

## Electron Desktop v1 trong tương lai
Ứng dụng sẽ được đóng gói bằng Electron, bọc lại shared React/Vite core để chạy như Desktop App.

## Desktop v1 online-first
Bản Desktop v1 sẽ yêu cầu kết nối mạng và tương tác trực tiếp với Firebase backend.

## System-browser OAuth
Sẽ dùng System browser cho các flow OAuth production.

## Offline/SQLite không thuộc v1
Tính năng offline-first và SQLite local db không nằm trong thiết kế của version 1.
