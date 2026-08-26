# AI_APPKHO DEVELOPMENT ROADMAP

**Roadmap version:** 3.0 — Dependency-Gated Modular Delivery · Web Demo → Firebase Production → Electron Desktop

> **Mục đích:** Đây là tài liệu roadmap và quy tắc thực thi bắt buộc cho AI khi phát triển ứng dụng AI_Appkho / TTC Material Hub.
>
> **Nguyên tắc cao nhất:** Chỉ có tối đa **một business module ACTIVE tại một thời điểm**. Số Module thể hiện nhóm logic của roadmap, **không phải thứ tự triển khai bắt buộc**. Module tiếp theo chỉ được mở sau khi vượt Dependency Gate, Impact Gate và được người dùng phê duyệt.

---

# 1. Nguyên tắc phát triển

## 1.1. Roadmap theo dependency, không theo số thứ tự bắt buộc

Roadmap vẫn được tổ chức theo chuỗi nghiệp vụ logic:

```text
Data
  ↓
Project
  ↓
BOM
  ↓
Planning
  ↓
Purchasing
  ↓
Warehouse
  ↓
Monitoring
```

Tuy nhiên, đây là **logical dependency map**, không phải lịch triển khai cứng.

Ví dụ:

```text
Module 1
Module 2
Module 3
...
```

không có nghĩa AI luôn phải triển khai đúng:

```text
1 → 2 → 3 → 4 → ...
```

Sau khi một module được người dùng nghiệm thu và khóa checkpoint, các module chưa triển khai sẽ được đánh giá lại theo:

```text
Dependency
+
Implementation Isolation
+
Regression Risk
+
Development Effort
+
Business Value
```

Module có số lớn hơn có thể được triển khai trước module có số nhỏ hơn nếu:

1. Tất cả dependency bắt buộc đã `ACCEPTED`.
2. Không cần thay đổi trái phép business contract của module đã khóa.
3. Phạm vi đủ cô lập.
4. Regression risk ở mức chấp nhận được.
5. Việc triển khai sớm có giá trị thực tế hoặc giúp mở khóa các module khác.
6. Người dùng đồng ý mở module đó.

> **Không được bỏ qua dependency chỉ vì một module dễ làm UI hơn hoặc AI cho rằng nên làm sớm.**

---

## 1.2. Một business module ACTIVE tại một thời điểm

Mặc dù cho phép triển khai ngoài thứ tự số, vẫn áp dụng:

```text
MAX ACTIVE BUSINESS MODULES = 1
```

Không phát triển nhiều module nghiệp vụ lớn song song.

Lý do:

- Dễ xác định regression thuộc module nào.
- Dễ review source.
- Dễ rollback/checkpoint.
- Tránh AI làm chồng business contract.
- Giữ `development-status.json` là nguồn trạng thái rõ ràng.

Developer tooling như `Development Roadmap Monitor` không được xem là một business module riêng.

---

## 1.3. Quy trình chuẩn của một module

Mỗi module phải đi qua:

```text
Trao đổi nghiệp vụ
        ↓
Chốt Specification / Change Request
        ↓
Module = ACTIVE
        ↓
Tạo Prompt triển khai
        ↓
Google AI Studio Build
        ↓
AI technical test
        ↓
Người dùng push source lên GitHub
        ↓
Consultant Code Review
        ├── FAIL → NEEDS_FIX → Prompt Fix → AI sửa → Push lại
        └── PASS
             ↓
Module = READY_FOR_ACCEPTANCE
             ↓
Consultant cung cấp Step-by-Step UI Acceptance Test
             ↓
Người dùng trực tiếp test trên UI
        ├── CHƯA ĐẠT → NEEDS_FIX
        └── ĐẠT
             ↓
Module = ACCEPTED 🔒
             ↓
Git checkpoint / tag
             ↓
Next Module Assessment
             ↓
Người dùng chọn module tiếp theo
```

### Hai cổng nghiệm thu bắt buộc

**Gate A — Code Acceptance**

Người chịu trách nhiệm review: **Consultant / ChatGPT**

Kiểm tra:

- canonical schema,
- business rule,
- permission,
- architecture,
- migration,
- compile/build evidence nếu có,
- regression,
- scope guard,
- module tương lai không bị triển khai sớm.

**Gate B — UI / Business Acceptance**

Người quyết định cuối cùng: **Người dùng**

Kiểm tra trực tiếp trên Web Demo:

- thao tác,
- workflow,
- notification,
- validation,
- dữ liệu sau save/refresh/reset,
- permission,
- trải nghiệm UI,
- kết quả nghiệp vụ thực tế.

> Google AI Studio báo “đã hoàn tất” **không đồng nghĩa module đã được nghiệm thu**.

---

## 1.4. Module tương lai được phép chuẩn bị ở mức nào

Module chưa ACTIVE chỉ được phép có:

- Type/interface tối thiểu cần cho module hiện tại.
- Route placeholder.
- UI placeholder disabled.
- Data field thật sự cần cho module hiện tại.
- Documentation/dependency declaration.

Không được triển khai business logic của module tương lai chỉ vì:

- “chuẩn bị trước”,
- “scalable”,
- “sẽ cần sau này”,
- “tiện làm luôn”.

---

## 1.5. Module đã ACCEPTED là LOCKED

```text
ACCEPTED = LOCKED
```

Module đã nghiệm thu không được tự ý:

- thay business rule,
- thay canonical contract,
- redesign workflow,
- đổi permission behavior,
- thay migration logic có thể phá dữ liệu,

trừ khi có:

```text
CHANGE REQUEST
```

được người dùng phê duyệt.

Change Request phải quay lại đúng chu trình:

```text
ACCEPTED
   ↓
Approved Change Request
   ↓
NEEDS_FIX / ACTIVE
   ↓
Code Review
   ↓
UI Acceptance
   ↓
ACCEPTED lại
```
# 2. Quy tắc bắt buộc cho AI

## 2.1. Kiểm soát Scope

AI phải:

1. Đọc file `roadmap.md` trước khi chỉnh sửa source.
2. Xác định module đang ACTIVE.
3. Chỉ triển khai scope đã được phê duyệt của module đó.
4. Không tự xây chức năng của module kế tiếp.
5. Không redesign module không liên quan.
6. Không thêm nghiệp vụ chưa được người dùng chốt.
7. Không phá chức năng đang hoạt động nếu scope hiện tại không yêu cầu.
8. Ưu tiên migration và backward compatibility thay vì thay schema phá hủy dữ liệu.

Các cụm như:
- “chuẩn bị cho tương lai”
- “làm scalable”
- “cải tiến architecture”

**không phải** quyền để AI tự phát triển module tương lai.

---

## 2.2. Quy tắc Demo Sandbox

Ứng dụng hiện tại là **Demo Sandbox**.

Phải giữ:

- Demo Mode mặc định.
- Data Provider / Repository abstraction.
- Demo Reset.
- Demo Role Switcher.
- Demo persistence hiện tại.
- Các route và module đang hoạt động.

Trong Demo Mode tuyệt đối không:

- Khởi tạo Firebase.
- Gọi Firestore.
- Gọi Firebase Authentication.
- Gọi Gemini.
- Upload BOM lên server.
- Gọi API ngoài.
- Gửi dữ liệu dự án/công ty ra ngoài trình duyệt.

---

## 2.3. Canonical Data Rule

Mỗi entity chính chỉ có **một canonical domain type**.

Ví dụ:

```text
Item
Project
Supplier
Brand
Transaction
```

Không tạo nhiều interface không tương thích cho cùng một entity ở các module khác nhau.

---

## 2.4. Business Logic Rule

Calculation phải đặt trong service hoặc pure function có thể tái sử dụng.

Không đặt business calculation quan trọng trực tiếp trong JSX.

Áp dụng cho:

```text
Material availability
Reservation
Purchase quantity
Price comparison
BOM normalization
BOM matching
Material readiness
```

---


## 2.5. Desktop-Ready Architecture Rule

### Mục tiêu triển khai

Ứng dụng được phát triển và nghiệm thu nghiệp vụ theo trình tự:

```text
Web Demo Sandbox
        ↓
Chốt toàn bộ nghiệp vụ
        ↓
Production Backend
        ↓
Desktop App v1
```

Kiến trúc mục tiêu:

```text
                         Firebase / Cloud
                  ┌─────────────────────────┐
                  │ Authentication          │
                  │ Firestore               │
                  │ Business Functions/API  │
                  └────────────▲────────────┘
                               │
                   ┌───────────┴───────────┐
                   │                       │
              Web Client             Desktop Client
              React/Vite             Electron
                   │                       │
                   └───────────┬───────────┘
                               │
                         Shared Core
                 ┌─────────────┴─────────────┐
                 │ UI Components             │
                 │ Domain Types              │
                 │ Business Services         │
                 │ DataProvider Interfaces   │
                 └───────────────────────────┘
```

### Quyết định kiến trúc đã chốt

- Web Demo hiện tại là frontend core, không phải bản dùng rồi bỏ.
- Desktop App v1 dự kiến sử dụng **Electron** để tái sử dụng React/Vite.
- Firebase vẫn có thể được sử dụng làm backend cho cả Web và Desktop.
- Desktop v1 là **online-first**.
- Offline-first với SQLite và sync engine không thuộc phiên bản đầu.
- Không cài Electron, Tauri hoặc desktop builder trong giai đoạn Web Demo.
- Desktop packaging chỉ bắt đầu sau khi các module Demo đã được nghiệm thu.

### Quy tắc code bắt buộc từ Module 1

1. Page/component không import hoặc gọi trực tiếp Firebase.
2. Page/component không truy cập trực tiếp `sessionStorage` hoặc `localStorage`.
3. Page/component không gọi trực tiếp Electron, Tauri, filesystem hoặc API native.
4. Data access chỉ đi qua `DataProvider`, Repository hoặc service interface đã duyệt.
5. Authentication chỉ đi qua `AuthProvider`.
6. Business calculation phải là pure function hoặc domain service.
7. File import/export phải tách khỏi page bằng service abstraction.
8. Browser storage chỉ được dùng cho Demo, không phải nguồn dữ liệu production.
9. Không lưu secret, service account hoặc token đặc quyền trong frontend.
10. Không dựa vào browser URL hoặc browser-only behavior cho business rule.
11. Shared domain types và services phải dùng lại được cho Web và Desktop.
12. Native desktop capability về sau chỉ được expose qua bridge/preload có giới hạn.

### Production security rule

Desktop `.exe` vẫn là client và không được xem là trusted backend.

Các nghiệp vụ nhạy cảm về sau như:

```text
Xác nhận kế hoạch vật tư
Reservation
Nhập hàng theo dự án
Xuất kho theo dự án
Điều chỉnh tồn
Thay đổi role
```

phải được bảo vệ bởi:

```text
Firebase Authentication
+
Firestore Security Rules
+
Cloud Functions / Cloud Run API / Backend Business Service
```

UI permission không thay thế server-side authorization.

### Desktop authentication rule

Nếu production dùng Google Workspace:

```text
Desktop App
    ↓
System Browser
    ↓
Google Login
    ↓
OAuth Callback
    ↓
Desktop App
```

Không thiết kế đăng nhập Google production bằng embedded WebView popup.

Trong giai đoạn Demo vẫn tiếp tục sử dụng Demo Role Switcher.

---


## 2.6. Development Status Governance

Trước mọi task phát triển, AI phải đọc:

```text
roadmap.md
development-status.json
```

`roadmap.md` là nguồn chuẩn về:

- business rule,
- module scope,
- dependency,
- Definition of Done,
- Change Management,
- Module Evaluation.

`development-status.json` là nguồn chuẩn machine-readable về:

- trạng thái runtime của roadmap,
- current module,
- dependency hiện tại,
- checkpoint,
- trạng thái khóa/mở.

### Status chuẩn

```typescript
type DevelopmentStatus =
  | 'BLOCKED'
  | 'ELIGIBLE'
  | 'ACTIVE'
  | 'NEEDS_FIX'
  | 'READY_FOR_ACCEPTANCE'
  | 'ACCEPTED';
```

Ý nghĩa:

| Status | Ý nghĩa | AI được làm gì |
|---|---|---|
| `BLOCKED` | Chưa đủ dependency hoặc chưa được phép mở | Không build |
| `ELIGIBLE` | Đủ điều kiện kỹ thuật để cân nhắc triển khai | Chưa build cho đến khi user chọn |
| `ACTIVE` | Module duy nhất đang được triển khai | Build đúng approved scope |
| `NEEDS_FIX` | Có lỗi code/UI hoặc Change Request đang xử lý | Chỉ sửa trong scope module đó |
| `READY_FOR_ACCEPTANCE` | Code Review PASS, chờ người dùng UI Acceptance | Không mở module khác |
| `ACCEPTED` | Người dùng đã nghiệm thu | LOCKED |

### Quy tắc chuyển trạng thái

```text
BLOCKED
   ↓ dependency satisfied
ELIGIBLE
   ↓ user selects
ACTIVE
   ↓ AI build + push
Code Review
   ├── fail → NEEDS_FIX
   │           ↓ fix + review
   └───────────┘
   ↓ pass
READY_FOR_ACCEPTANCE
   ↓ user UI acceptance
   ├── fail → NEEDS_FIX
   └── pass
ACCEPTED 🔒
```

Không được chuyển:

```text
READY_FOR_ACCEPTANCE → ACCEPTED
```

nếu người dùng chưa xác nhận UI Acceptance.

Không được chuyển:

```text
BLOCKED / ELIGIBLE → ACTIVE
```

nếu chưa có quyết định của người dùng.

---

## 2.7. Next Module Assessment Rule

Sau mỗi module `ACCEPTED`, Consultant phải đánh giá **tất cả module chưa triển khai**, không mặc định chọn module có số kế tiếp.

### Mandatory Gate A — Dependency Gate

Module chỉ được xem là `ELIGIBLE` nếu mọi dependency bắt buộc đã `ACCEPTED`.

Ví dụ:

```text
Purchasing
```

không được mở nếu business contract cần từ:

```text
Planning
```

chưa hoàn tất.

### Mandatory Gate B — Locked Contract Impact Gate

Module chỉ `ELIGIBLE` nếu implementation dự kiến:

- không phá canonical schema của module đã ACCEPTED,
- không thay business behavior đã chốt,
- không yêu cầu silent migration nguy hiểm,
- không buộc redesign module đã khóa.

Nếu cần thay module đã khóa:

```text
→ tạo Change Request trước
```

### Priority Assessment

Chỉ các module vượt cả hai Mandatory Gate mới được chấm ưu tiên.

| Tiêu chí | Trọng số | Đánh giá |
|---|---:|---|
| Business Value | 30 | Giá trị trực tiếp cho Demo/nghiệp vụ |
| Enablement Value | 25 | Mức mở khóa module khác |
| Implementation Isolation | 20 | Ít coupling thì điểm cao |
| Development Speed / Effort | 15 | Làm nhanh, scope rõ thì điểm cao |
| Regression Safety | 10 | Rủi ro thấp thì điểm cao |
| **Tổng** | **100** | |

Mỗi tiêu chí chấm từ `1–5`, quy đổi theo trọng số.

### Kết quả Next Module Assessment

Consultant phải trả về tối thiểu:

| Module | Dependency Gate | Impact Gate | Priority Score | Recommendation |
|---|---|---|---:|---|
| Module X | PASS/FAIL | PASS/FAIL | 0–100 | ELIGIBLE/BLOCKED |
| Module Y | PASS/FAIL | PASS/FAIL | 0–100 | ELIGIBLE/BLOCKED |

Sau đó đề xuất:

```text
RECOMMENDED NEXT MODULE = <Module>
```

kèm lý do.

**Người dùng là người quyết định cuối cùng module nào chuyển `ELIGIBLE → ACTIVE`.**

---

## 2.8. Code Review Responsibility Rule

Sau khi Google AI Studio thông báo hoàn thành:

1. Người dùng push code lên GitHub.
2. Consultant đọc source từ GitHub.
3. Consultant đối chiếu:
   - approved specification,
   - roadmap,
   - current `development-status.json`,
   - previous accepted contracts.
4. Nếu lỗi:
   - phân loại `BLOCKER / MUST FIX / CAN DEFER`,
   - tạo Prompt Fix,
   - giữ module ở `NEEDS_FIX`,
   - giữ module khác không ACTIVE.
5. Nếu Code Review PASS:
   - module chuyển `READY_FOR_ACCEPTANCE`,
   - Consultant tạo Step-by-Step UI Acceptance Test.

Consultant không thay người dùng quyết định UI/business đã đạt.

---

## 2.9. UI Acceptance Responsibility Rule

Người dùng trực tiếp quyết định:

```text
ĐẠT
hoặc
CHƯA ĐẠT
```

UI Acceptance Test phải ưu tiên:

- luồng chính của module,
- validation input,
- duplicate handling,
- success/error/warning notification,
- create/edit/status change,
- permission,
- persistence/refresh,
- Demo Reset,
- regression có liên quan trực tiếp.

Nếu `CHƯA ĐẠT`:

```text
Module → NEEDS_FIX
```

và Consultant tạo Prompt Fix dựa đúng lỗi UI thực tế.

Nếu `ĐẠT`:

```text
Module → ACCEPTED
```

sau đó mới tạo checkpoint.

---

## 2.10. Notification & Validation UX Rule

Mọi action create/update/status/import/permission quan trọng phải có phản hồi rõ cho người dùng.

Tối thiểu hỗ trợ:

```text
SUCCESS
ERROR
WARNING
INFO
```

Không được silent fail hoặc chỉ `console.error()`.

Các trường hợp validation như:

- field bắt buộc,
- duplicate,
- dữ liệu không hợp lệ,
- import lỗi,
- permission denied,

phải có thông báo dễ hiểu trên UI.

# 3. Cấu trúc Sidebar mục tiêu

```text
ĐIỀU HÀNH
  Dashboard
  Giám sát vật tư dự án

DỰ ÁN & VẬT TƯ
  Quản lý dự án
  Danh mục vật tư

QUẢN LÝ KHO
  Nhập kho
  Xuất kho
  Lịch sử giao dịch

HỆ THỐNG
  Danh mục hệ thống
  Người dùng

PHÁT TRIỂN · DEMO
  Tiến độ phát triển
```

Quy tắc:

- Không tạo `Tổng quan → Tổng quan`.
- `Dashboard` và `Giám sát vật tư dự án` là hai chức năng khác nhau.
- Purchasing nằm trong từng Project, chưa tạo top-level Purchasing module.
- BOM thuộc Project, không tạo sidebar BOM riêng.
- `Tiến độ phát triển` chỉ hiển thị trong Demo Mode.
- `Người dùng` và `Tiến độ phát triển` chỉ ADMIN truy cập.
- Sidebar visibility của MANAGER/ENGINEER được cấu hình bởi ADMIN.
- Sidebar permission không thay thế action permission.
- Route guard phải enforce quyền, không chỉ hide menu.
# 4. MODULE 0 — Baseline Demo, Branding & Navigation

## Mục tiêu

Thiết lập nhận diện ứng dụng, Sidebar mục tiêu và Demo Sandbox an toàn trước khi phát triển nghiệp vụ.

## Phạm vi được giữ

- Tên ứng dụng `TTC Material Hub`.
- Subtitle `Project Material & Inventory Management`.
- Browser metadata.
- Sidebar theo nhóm chức năng.
- Placeholder `Quản lý dự án`.
- Placeholder `Giám sát vật tư dự án`.
- Demo Banner.
- Demo Role Switcher.
- Demo Reset.
- Repository/DataProvider baseline.
- Firestore deny-all trong Demo.

## Trạng thái

Phần branding/navigation đã được triển khai nhưng baseline source cần được làm sạch trước khi nghiệm thu.

Không xem Module 0 hoàn thành cho đến khi Module 0.1 đạt Definition of Done.

---

# 4.1. MODULE 0.1 — Clean Baseline & Desktop Readiness

## Mục tiêu

Đưa `main` về đúng baseline trước Roadmap, loại bỏ business code của các module tương lai đã được sinh sớm và khóa kiến trúc tương thích Web + Desktop.

## Bối cảnh bắt buộc

Source hiện tại đã phát sinh trước thời điểm cho phép:

```text
Project Core
BOM Import/Matching
Material Planning
Reservation
Project Purchasing
Export BOM/Purchase
```

Các phần này không được giữ trong baseline vì:

- Module 1 chưa được nghiệm thu.
- Business rule Project Qty/Stock Qty chưa được áp dụng.
- Type và UI hiện tại không đồng bộ hoàn toàn.
- Code tương lai có thể gây AI tái sử dụng logic cũ.

## Scope cleanup

### Phải giữ

- `roadmap.md`.
- `TTC Material Hub` branding.
- Sidebar mục tiêu.
- `ComingSoonPage`.
- Placeholder routes cho Module 2 và Module 8.
- Demo Sandbox.
- Demo Banner và Role Switcher.
- Firestore deny-all.
- DataProvider baseline cho các module hiện đang hoạt động.
- Dashboard, Items, Inbound, Outbound, Transactions, Master Data và Users hiện tại.

### Phải loại khỏi baseline

- Business implementation của `src/modules/projects/**`.
- BOM parser/matcher/import/export.
- Material Planner.
- Reservation logic.
- Purchase Requirement logic.
- Procurement UI.
- Future Project domain types.
- Future DataProvider methods và Demo collections tương ứng.
- Các file `patch_*.cjs` dùng một lần.
- Dependency BOM được thêm sớm:
  - `papaparse`
  - `xlsx`
  - `@types/papaparse`

### Baseline data model

Khôi phục canonical type tương thích với UI hiện tại:

```text
Item cơ bản
Category
Unit
Project cơ bản phục vụ Outbound
Supplier cơ bản
Transaction
User
```

Brand, ItemSupplier và Item Master nâng cao chỉ được xây ở Module 1.

Project Core nâng cao chỉ được xây ở Module 2.

### Demo schema version

Bổ sung:

```typescript
schemaVersion: number
```

và cơ chế migration/reset an toàn.

Nếu gặp dữ liệu Demo cũ:

- Giữ các collection baseline tương thích nếu có thể.
- Map Item nâng cao về Item baseline nếu cần.
- Map Project về `{ id, code, name }`.
- Nếu dữ liệu hỏng hoặc không migrate được, reset về seed và thông báo rõ.
- Không để JSON cũ làm app crash.

### Documentation cleanup

Cập nhật:

- `.env.example`
- `README_DEMO.md`
- package name nếu an toàn
- metadata app nếu cần

`.env.example` tối thiểu:

```env
VITE_APP_MODE=demo
VITE_DEMO_PERSISTENCE=session
```

README phải:

- dùng tên `TTC Material Hub`,
- nói rõ mặc định là Demo,
- không hướng dẫn sai rằng để trống sẽ vào production,
- ghi rõ Firebase/Gemini không được gọi trong Demo,
- mô tả Repository/DataProvider baseline.

### Desktop readiness

- Tuân thủ mục `Desktop-Ready Architecture Rule`.
- Không cài Electron/Tauri.
- Không tạo desktop wrapper.
- Không thêm native API.
- Chỉ đảm bảo core hiện tại không phụ thuộc trực tiếp vào Firebase/browser storage ở page.

## Git rule

Không rewrite lịch sử Git và không `reset --hard` để xóa commit cũ.

Thực hiện cleanup bằng commit mới. Prototype cũ vẫn được bảo toàn trong Git history.

Nếu môi trường hỗ trợ, có thể tạo branch/tag archive nhưng không bắt buộc.

## Test bắt buộc

| Kiểm tra | Bắt buộc |
|---|---:|
| Demo Reset | ✓ |
| Demo Role Switcher | ✓ |
| Dashboard | ✓ |
| Items | ✓ |
| Inbound | ✓ |
| Outbound | ✓ |
| Transactions | ✓ |
| Master Data | ✓ |
| Users | ✓ |
| Placeholder Project | ✓ |
| Placeholder Monitoring | ✓ |
| TypeScript | ✓ |
| Production Web Build | ✓ |
| Không Firebase request | ✓ |
| Không Gemini request | ✓ |
| Không future module business code | ✓ |
| Demo schema migration/reset | ✓ |

## Điều kiện hoàn thành

Chỉ sau khi toàn bộ test PASS và người dùng nghiệm thu mới tạo checkpoint:

```text
baseline-demo-stable
```

Sau checkpoint này mới được mở Module 1.

---

# 5. MODULE 1 — Item Master, Master Data & Demo Access Control

## Mục tiêu

Tạo nền dữ liệu vật tư ổn định cho Project, BOM, Supplier và các module sau; đồng thời hoàn thiện UX validation/notification và Demo access control cần thiết để nghiệm thu các module tiếp theo.

## Trạng thái nghiệp vụ hiện tại

Module 1 đã qua nhiều vòng Code Review và hiện có **Change Request 01** sau UI review.

Các quyết định mới nhất trong mục này ghi đè quyết định cũ của Module 1.

---

## 5.1. Item Identification Rule

Ứng dụng phục vụ mô hình **nhà thầu**, không dùng SKU nội bộ cho kinh doanh.

Do đó:

```text
SKU = REMOVED
```

Khóa định danh vật tư:

```text
Brand + Model
```

Canonical duplicate key:

```text
brandId + modelNormalized
```

Không cho tồn tại hai Item cùng `Brand + Model`, kể cả Item `INACTIVE`.

---

## 5.2. Canonical Item

Tối thiểu:

```text
Model
Model Normalized
Brand
Tên vật tư
Description
Manufacturer Part Number
Category
Unit
Item Type
Current Stock
Safety Stock
Datasheet URL
Technical Note
Status
Source
Created/Updated Audit
```

Không lưu/hiển thị SKU trong Item Master mới.

BOM về sau match theo:

```text
Model + Brand
```

---

## 5.3. Item List UI

Thứ tự cột chuẩn:

```text
Nhóm hàng
Hãng
Model
Tên vật tư
Tồn kho
Đơn vị
Trạng thái
Chi tiết
```

Search:

```text
Nhóm hàng
Hãng
Model
Tên vật tư
```

Filter:

```text
Nhóm hàng
Hãng
Trạng thái
```

---

## 5.4. Item Detail UI

Không dùng right-side drawer làm layout chính.

Dùng centered modal/dialog có không gian ngang lớn:

```text
max-width khoảng 1100–1200px
center screen
responsive
internal scroll
```

Tabs:

```text
Thông tin
Tồn kho
Nhà cung cấp & Giá
```

Các text dài phải wrap/truncate hợp lý và không làm mất cột.

---

## 5.5. Brand / Manufacturer

Quản lý:

- Mã hãng.
- Tên hãng.
- Alias.
- Active/Inactive.
- Add/Edit.
- Duplicate validation.
- Alias normalization/deduplication.

Brand inactive không dùng cho Item mới nhưng dữ liệu cũ vẫn hiển thị.

---

## 5.6. Category

Quản lý Category một cấp.

Quy tắc:

- Required.
- Unique case-insensitive.
- Không xóa nếu Item đang sử dụng.

Không làm category tree trong v1.

---

## 5.7. Unit

Quản lý đơn vị tính.

Quy tắc:

- Required.
- Unique case-insensitive.
- Không xóa nếu Item đang sử dụng.

---

## 5.8. Supplier

Required fields:

```text
Mã NCC
Tên NCC
Số điện thoại
Mã số thuế
Địa chỉ
```

Optional:

```text
Email
Zalo
Ghi chú
```

Hỗ trợ:

- Add.
- Edit.
- Active/Inactive.
- Duplicate code validation.
- Required-field notification.

---

## 5.9. Item ↔ Supplier

Một Item có thể có nhiều Supplier.

Mỗi quan hệ lưu:

```text
Supplier
Supplier Part Number
Previous Price
Current Price
Currency
Quote Date
Updated Date
Preferred
Status
```

Mỗi Item chỉ có tối đa một `ACTIVE Preferred Supplier`.

Lowest Price chỉ so sánh:

```text
status = ACTIVE
currentPrice > 0
currency = VND
```

Lowest Price không tự động trở thành Preferred.

---

## 5.10. Update Price

Nếu chưa có giá:

```text
previousPrice = undefined
currentPrice = newPrice
```

Nếu đã có:

```text
previousPrice = old currentPrice
currentPrice = newPrice
```

`priceQuoteDate` do người dùng nhập.

`priceUpdatedAt` là system timestamp.

UI phải hiển thị:

```text
Giá hiện tại
Giá mới
Chênh lệch tuyệt đối
Chênh lệch %
Ngày báo giá
```

Không tạo full Price History trong Module 1.

---

## 5.11. Excel Import Item Master

Trong `Danh mục vật tư` phải có:

```text
Import Excel
Tải file mẫu
```

Template:

```text
TTC_Material_Hub_Item_Import_Template.xlsx
```

Workbook:

```text
Sheet 1: Item Import
Sheet 2: Hướng dẫn
```

### Columns

```text
Nhóm hàng
Hãng sản xuất
Model
Tên vật tư
Đơn vị tính
Loại vật tư
Manufacturer Part Number
Mô tả
Tồn kho an toàn
Datasheet URL
Ghi chú kỹ thuật
Trạng thái
```

Required:

```text
Nhóm hàng
Hãng sản xuất
Model
Tên vật tư
Đơn vị tính
Loại vật tư
```

Không import `Current Stock`.

Item import mới:

```text
currentStock = 0
source = IMPORT
```

### Import Flow

```text
Select File
    ↓
Parse
    ↓
Preview
    ↓
Validate
    ↓
Confirm Import
```

Không silently skip dòng lỗi.

Validation tối thiểu:

- Category tồn tại.
- Brand resolve theo name/alias.
- Unit tồn tại.
- Model required.
- `Brand + Model` không duplicate trong database/file.
- Item Type hợp lệ.
- Status hợp lệ.
- Safety Stock >= 0.

---

## 5.12. Basic Project Master Compatibility

`Dự án (Cơ bản)` vẫn chỉ dùng schema:

```text
id
code
name
```

Module 1 được phép:

```text
Add
Edit
Delete
```

Validate:

- Project Code required.
- Project Name required.
- Project Code unique case-insensitive.

Không thêm Project Status trước Module 2.

---

## 5.13. Demo Roles

Roles chính thức:

```text
ADMIN
MANAGER
ENGINEER
```

Loại bỏ role:

```text
PURCHASING
```

Hierarchy:

```typescript
ADMIN = 3
MANAGER = 2
ENGINEER = 1
```

Hierarchy chỉ biểu diễn cấp quản lý, không thay explicit permission.

---

## 5.14. Sidebar Permission Mapping

ADMIN cấu hình menu được xem cho:

```text
MANAGER
ENGINEER
```

Permission keys:

```text
DASHBOARD
MATERIAL_MONITORING
PROJECTS
ITEMS
INBOUND
OUTBOUND
TRANSACTIONS
MASTER_DATA
```

Không configurable:

```text
USERS
DEVELOPMENT_ROADMAP
```

hai menu này ADMIN-only.

Permission phải enforce cả:

```text
Sidebar visibility
+
Route access
```

ENGINEER vẫn read-only với core Item/Master Data nếu được cấp quyền xem.

---

## 5.15. Notification / Validation UX

Mọi create/update/status/import/permission action phải có feedback.

Ví dụ:

```text
Thêm vật tư thành công.
Cập nhật vật tư thành công.
Cập nhật nhà cung cấp thành công.
Cập nhật giá thành công.
Cập nhật phân quyền thành công.

Model này đã tồn tại với cùng hãng sản xuất.
Mã NCC đã tồn tại.
Vui lòng nhập đầy đủ trường bắt buộc.
File Excel có dòng không hợp lệ.
```

Không silent fail.

---

## 5.16. Demo Schema Migration

Module 1 Change Request nâng schema khi bỏ SKU và thay role.

Migration phải:

- không mất ItemSupplier,
- không mất Supplier,
- không làm app crash với Demo data cũ,
- xử lý transaction snapshot cũ an toàn,
- Demo Reset khôi phục seed canonical mới.

---

## 5.17. Inbound / Outbound trong phạm vi Module 1

Người dùng **chưa nghiệm thu nghiệp vụ Nhập/Xuất kho** trong Module 1.

Module 1 chỉ cần giữ compatibility khi:

- bỏ SKU,
- đổi role,
- thêm route/sidebar permission.

Không redesign business flow Nhập/Xuất trong Change Request này.

---

## Test bắt buộc trước Code Review PASS

| Nhóm | Test |
|---|---|
| Item | Add/Edit, duplicate Brand+Model, filter/search |
| UI | Center modal, long text không phá layout |
| Excel | Template download, valid import, invalid/duplicate preview |
| Brand | Add/Edit/Inactive/Duplicate |
| Category/Unit | Duplicate + delete-used block |
| Supplier | Required fields, Add/Edit/Inactive |
| Price | Previous/Current, Quote Date, Lowest, Preferred |
| Project Basic | Add/Edit/Delete + code unique |
| Users | 3 roles, role change |
| Sidebar | Manager/Engineer mapping + direct URL guard |
| UX | Success/error/warning notification |
| Demo | Migration, refresh, Demo Reset |
| Technical | TypeScript/lint/build |
| Scope | Module 2 chưa triển khai |

**Checkpoint sau khi người dùng UI Acceptance:** `item-master-v1`

---

## Không làm trong Module 1

- Project Core.
- BOM.
- BOM Import.
- Material Planning.
- Reservation.
- Project Purchasing.
- Project Receiving.
- Project Outbound mới.
- Material Monitoring logic.
- Full Price History.
- Production Firebase.
- Electron/Tauri packaging.
# 6. MODULE 2 — Project Core

## Mục tiêu

Xây dựng Project entity và Project UI, chưa triển khai BOM/Planning/Purchasing.

## Scope

### Project List

- Mã dự án.
- Tên dự án.
- Người phụ trách.
- Ngày bắt đầu.
- Ngày dự kiến hoàn thành.
- Trạng thái.
- Ghi chú.

### Project Detail

Tạo các tab:

```text
Tổng quan
BOM
Kế hoạch vật tư
Mua hàng
Lịch sử
```

Ở module này chỉ `Tổng quan` hoàn chỉnh.

Các tab còn lại chỉ empty state, chưa có business logic.

### Project Status

```text
DRAFT
BOM_IMPORTED
BOM_VALIDATED
MATERIAL_PLANNED
PROCUREMENT_READY
IN_PROGRESS
COMPLETED
CANCELLED
```

### Nguồn dữ liệu Project

Toàn app chỉ dùng một `ProjectRepository`.

Không duy trì Project list độc lập trong Master Data.

## Test

- Tạo Project.
- Trùng Project Code.
- Sửa Project.
- Cancel Project.
- Search/filter.
- Không hard delete Project đã có dữ liệu.
- Active Project hiển thị đúng.
- Role permission.

**Checkpoint:** `project-core-v1`

---

# 7. MODULE 3 — BOM Management

## Mục tiêu

Import, validate, revision, matching và xử lý model mới.

## BOM Import Engine

Hỗ trợ:

```text
XLSX
CSV
```

Flow:

```text
File
 ↓
Sheet
 ↓
Column Mapping
 ↓
Preview
 ↓
Validation
 ↓
Import
```

Trường bắt buộc:

```text
Model
Brand
Quantity
```

Trường tùy chọn:

```text
Description
Unit
Reference
Location
Note
```

## BOM Revision

```text
REV-01
REV-02
REV-03
```

Không sửa trực tiếp revision đã Approved.

## Matching

Auto Match:

```text
Normalized Model + Brand
```

Status:

```text
MATCHED
AMBIGUOUS
UNMATCHED
MANUAL_MATCHED
NEW_ITEM_PENDING
NEW_ITEM_CREATED
PROJECT_ONLY_ITEM
```

Similarity chỉ dùng gợi ý.

Không auto-match kết quả không chắc chắn.

## Model mới

Model mới **không làm import thất bại**.

Ba hướng:

```text
Model mới
   │
   ├── Match Item hiện có
   ├── Tạo Item Master mới
   └── Project-only Item
```

Project-only:

```text
Available Stock = 0
Purchase Requirement = BOM requirement
```

## Test bắt buộc

- XLSX.
- CSV.
- Multi-sheet Excel.
- Column Mapping.
- Model format khác.
- Brand alias.
- Model mới.
- Duplicate.
- Quantity âm.
- Quantity decimal.
- Manual Match.
- New Item.
- Project-only.
- Revision mới.

**Checkpoint:** `project-bom-v1`

---

# 8. MODULE 4 — Material Planning & Reservation

## Mục tiêu

Tính khả dụng vật tư, phân bổ kho, nhu cầu mua và reservation theo Project.

## Bảng Planning

```text
Project Qty
Stock Qty
Total Planned Qty
On Hand
Reserved
Safety Stock
Available
Allocated
Calculated Purchase
Final Purchase
```

## Quy tắc Project Qty và Stock Qty

Không dùng một trường BOM duy nhất.

```text
Project Qty
+
Stock Qty
=
Total Planned Qty
```

Ví dụ:

```text
Project Qty = 8
Stock Qty   = 2
```

- 8 là nhu cầu thật của dự án.
- 2 là số mua thêm thông qua dự án để lưu kho.

## Công thức

```text
Available =
MAX(
  0,
  Current Stock
  - Reserved Other Projects
  - Safety Stock
)
```

Chỉ phân bổ kho cho `Project Qty`:

```text
Allocated To Project =
MIN(Project Qty, Available)
```

```text
Project Purchase Qty =
MAX(
  0,
  Project Qty
  - Allocated To Project
)
```

```text
Total Purchase Qty =
Project Purchase Qty
+
Stock Qty
```

## Reservation

Chỉ reservation:

```text
Allocated To Project
```

Không reservation `Stock Qty`.

BOM Draft chỉ preview.

Chỉ tạo reservation sau:

```text
Xác nhận kế hoạch vật tư
```

## Test quan trọng

Ví dụ:

```text
Stock = 10
Project A = 6
Project B = 7
```

Sau khi A reserve:

```text
Project B Available = 4
```

Test thêm:

- Safety Stock.
- Revision mới.
- Cancel Project.
- Manual Purchase Quantity.
- Không over-allocation.

**Checkpoint:** `material-planning-v1`

---

# 9. MODULE 5 — Purchasing theo Project

## Mục tiêu

Quản lý nhu cầu mua bên trong từng Project.

Không tạo top-level Purchasing module.

```text
Project
  ↓
Mua hàng
```

## Trường

```text
Model
Brand
Project Purchase Qty
Stock Qty
Total Purchase Qty
Supplier
Current Price
Total
Expected Delivery Date
Status
```

## Supplier Comparison

Đơn giản:

| Supplier | Giá trước | Giá hiện tại | Ngày giá | Tổng |
|---|---:|---:|---|---:|

Đánh dấu:

```text
Giá thấp nhất
```

Không auto-select.

## Chọn Supplier

Lưu:

```text
selectedSupplier
selectedPrice
priceSnapshot
```

Giá Project không tự thay đổi khi Supplier update giá về sau.

## Expected Delivery Date

Có field:

```text
expectedDeliveryDate
```

Dùng cho:

- Đang chờ hàng.
- Sắp tới hạn.
- Quá hạn.
- Monitoring.

Chưa build Receiving.

## Export

Excel:

```text
Purchase List
BOM Detail
Unresolved Items
```

Có Draft/Official.

## Test

- Supplier nhiều giá.
- Supplier chưa có giá.
- Chọn Supplier thấp nhất.
- Chọn Supplier giá cao hơn.
- Snapshot.
- Update giá sau snapshot.
- ETA.
- Export.

**Checkpoint:** `project-procurement-v1`

---

# 10. MODULE 6 — Nhập hàng theo dự án

## Mục tiêu

Phân biệt hàng nhận để đáp ứng Project và hàng mua thêm để lưu kho.

Module này phải trao đổi/chốt nghiệp vụ riêng trước khi build.

## Hai chế độ

```text
Nhập theo dự án
Nhập kho thông thường
```

## Project Receiving Flow

```text
Project
 ↓
BOM
 ↓
Supplier / Item
 ↓
Hàng nhận
 ↓
Phân bổ:
  Project
  Stock
```

Ví dụ:

```text
Project Qty              = 8
Allocated From Stock     = 3
Project Purchase Qty     = 5
Stock Purchase Qty       = 2

Supplier giao            = 7
```

Đề xuất:

```text
Project Receipt = 5
Stock Receipt   = 2
```

## Trạng thái nhận hàng

Theo dõi:

```text
Project Qty
Allocated From Stock
Received For Project
Remaining Project Qty
Stock Qty Planned
Received To Stock
```

```text
Project Fulfilled =
Allocated From Stock
+
Received For Project
```

```text
Remaining Project Qty =
MAX(
  0,
  Project Qty
  - Project Fulfilled
)
```

## Checkpoint nghiệp vụ bắt buộc

Trước khi build phải chốt một trong hai:

### Option A
Hàng Project nhận trực tiếp và không tăng `currentStock`.

### Option B
Tất cả hàng vật lý phải nhập kho trước rồi mới xuất cho Project.

Quyết định này ảnh hưởng:

- Stock ledger.
- Inbound.
- Outbound.
- Reservation.
- Readiness.
- Audit.

> **Không build Module 6 khi quy tắc này chưa được người dùng chốt.**

## Test

- Giao đủ.
- Giao thiếu.
- Giao nhiều lần.
- Giao dư.
- Split Project/Stock.
- Không double-count.
- Stock đúng.
- Project fulfillment đúng.
- Readiness đúng.

**Checkpoint:** `project-receiving-v1`

---

# 11. MODULE 7 — Xuất kho theo Project

## Mục tiêu

Xuất vật tư đã được reservation cho đúng Project.

Flow:

```text
Project
 ↓
Item Reserved
 ↓
Xuất kho
 ↓
Reservation
RESERVED → ISSUED
 ↓
Current Stock giảm
```

Không cho Project A xuất reservation của Project B.

Không âm kho.

## Test

- Reservation ownership.
- Partial Issue.
- Full Issue.
- Không âm kho.
- Reservation status.
- Transaction history.

**Checkpoint:** `project-outbound-v1`

---

# 12. MODULE 8 — Giám sát vật tư dự án

## Mục tiêu

Phục vụ cấp quản lý trả lời:

> Dự án nào đang có vấn đề về vật tư và cần xử lý gì?

Chỉ build khi lifecycle dữ liệu Project/BOM/Planning/Purchasing/Warehouse đã ổn định.

## Monitoring Table

| Project | Readiness | Đủ | Thiếu | Đang chờ | Quá hạn | Chưa NCC | Chưa giá | Chi phí |
|---|---:|---:|---:|---:|---:|---:|---:|---:|

## Material Readiness v1

```text
Material Readiness =
Fully Fulfilled BOM Lines
/
Total Required BOM Lines
× 100
```

Không làm công thức phức tạp ở v1.

## Exception Filter

```text
Thiếu vật tư
Chưa mua
Chưa Supplier
Chưa giá
Đang chờ hàng
Sắp tới hạn
Quá hạn
Model chưa xử lý
```

Click phải mở đúng Project và đúng tab liên quan.

**Checkpoint:** `material-monitoring-v1`

---

# 13. MODULE 9 — Dashboard cấp quản lý

## Mục tiêu

Executive Summary dựa trên dữ liệu đã ổn định.

Sidebar:

```text
ĐIỀU HÀNH
  Dashboard
  Giám sát vật tư dự án
```

Không tạo `Tổng quan → Tổng quan`.

## KPI

### Project

```text
Active Projects
Material Ready
At Risk
```

### Inventory

```text
Total Items
Low Stock
Out of Stock
```

### Project Material

```text
Items Required
Waiting Supplier
Waiting Price
Waiting Delivery
Overdue
```

### Cost

```text
Estimated Purchase Value
```

### Warehouse

```text
Today's Inbound
Today's Outbound
```

### Recent Activity

Chỉ hiển thị thông tin quản lý quan trọng.

Dashboard chỉ tổng hợp và điều hướng.

Không biến Dashboard thành trang xử lý giao dịch.

**Checkpoint:** `management-dashboard-v1`

---

# 14. MODULE 10 — Lịch sử giao dịch & Audit

## Mục tiêu

Chuẩn hóa lịch sử sau khi Project và Warehouse hoàn thiện.

Tách rõ:

### Warehouse Transaction

```text
INBOUND
OUTBOUND
```

### Project Activity

```text
BOM Imported
Supplier Selected
Price Updated
Material Plan Confirmed
Purchase List Exported
```

Không trộn hai loại dữ liệu.

`Lịch sử giao dịch` chủ yếu là Warehouse Transaction.

Project Activity nằm trong Project.

## Filter

- Date.
- Project.
- Item.
- Transaction Type.
- User.

**Checkpoint:** `transaction-history-v2`

---

# 15. MODULE 11 — Permission Review toàn hệ thống

## Mục tiêu

Thực hiện review permission cuối cùng sau khi các module nghiệp vụ Demo đã hoàn chỉnh.

Roles canonical:

```text
ADMIN
MANAGER
ENGINEER
```

Module 1 chịu trách nhiệm tạo nền:

- role hierarchy,
- Sidebar permission mapping,
- route guard,
- Demo Role Switcher 3 role.

Module 11 không xây lại từ đầu; chỉ review toàn hệ thống khi các module đã có đầy đủ action.

Kiểm tra:

- Sidebar visibility.
- Route access.
- Button/action permission.
- Read-only behavior.
- ADMIN-only Users.
- ADMIN-only Development Roadmap Monitor.
- Role Sidebar mapping.
- Permission regression sau khi thêm module mới.
- Không privilege escalation.
- Demo Reset permission defaults.

Không triển khai production authentication trong roadmap Demo này.

**Checkpoint dự kiến:** `permission-review-v1`

---
# 15.1. PHASE 12 — Production Backend & Desktop Packaging

## Mục tiêu

Sau khi toàn bộ module Web Demo được nghiệm thu, chuyển shared core hiện tại thành hệ thống production và đóng gói Desktop App.

Phase này không được bắt đầu trong khi Module 0–11 còn chưa hoàn tất.

## 12A — Production Backend

Phạm vi dự kiến:

- Firebase Authentication production.
- Firestore schema production.
- Firestore Security Rules theo role.
- Cloud Functions/Cloud Run API cho nghiệp vụ nhạy cảm.
- Audit timestamp phía server.
- Error logging.
- Backup/restore policy.
- Môi trường development/staging/production.

Không cho production client trực tiếp bypass business rule bằng `updateDoc()` ở các thao tác critical.

## 12B — Electron Desktop App v1

Phạm vi dự kiến:

- Electron main process.
- React/Vite renderer dùng shared core.
- Secure preload/IPC bridge.
- Context isolation.
- Native file dialog cho import/export.
- System browser authentication.
- Windows installer.
- App versioning.
- Code signing và update strategy khi cần.

## Online-first rule

Desktop v1 sử dụng Firebase/Cloud backend và yêu cầu kết nối mạng cho nghiệp vụ critical.

Offline-first, SQLite local database và sync engine là một phase độc lập về sau, không mặc định nằm trong Desktop v1.

## Acceptance Gate

- Shared Web core không phải rewrite.
- Web và Desktop dùng chung domain/service/DataProvider contract.
- Desktop không chứa secret.
- Auth không dùng embedded WebView OAuth.
- Native APIs chỉ expose qua bridge giới hạn.
- Production security được enforce phía backend.

**Checkpoint dự kiến:** `desktop-production-v1`

---

# 16. Dependency Map & Module Eligibility

Số Module là mã nhóm logic, không phải queue bắt buộc.

| Module / Phase | Dependency tối thiểu để ELIGIBLE |
|---|---|
| 0 — Baseline Demo | — |
| 0.1 — Clean Baseline | Module 0 implementation |
| 1 — Item Master + Master Data | Baseline accepted |
| 2 — Project Core | Item/Master Data contract accepted |
| 3 — BOM Management | Project Core + Item identification accepted |
| 4 — Material Planning & Reservation | BOM + Inventory contract accepted |
| 5 — Purchasing theo Project | Planning + Supplier/Price contract accepted |
| 6 — Nhập hàng theo Project | Purchasing contract accepted |
| 7 — Xuất kho theo Project | Reservation + Receiving contract accepted |
| 8 — Giám sát vật tư dự án | Các lifecycle source cần thiết đã accepted |
| 9 — Dashboard quản lý | KPI source modules cần thiết đã accepted |
| 10 — Transaction/Audit | Các transaction/activity source cần review đã accepted |
| 11 — Permission Review | Các module Demo cần permission review đã hoàn chỉnh |
| 12 — Production Backend + Electron | Demo business roadmap đã nghiệm thu |

### Dependency không nhất thiết là toàn bộ module số trước

Ví dụ Module 10 có thể được mở sớm nếu:

- transaction contract liên quan đã ổn định,
- không phụ thuộc các transaction tương lai chưa tồn tại,
- implementation đủ cô lập,
- người dùng muốn ưu tiên audit sớm.

Ngược lại Module 5 không được mở nếu Planning contract cần thiết vẫn chưa accepted.

---

# 17. Module Evaluation & Selection Process

Sau mỗi UI Acceptance `ĐẠT`, thực hiện:

## Step 1 — Lock module vừa nghiệm thu

```text
READY_FOR_ACCEPTANCE
        ↓
ACCEPTED 🔒
        ↓
Git checkpoint
```

## Step 2 — Re-evaluate toàn bộ module chưa làm

Không mặc định module `N+1`.

## Step 3 — Mandatory gates

Mỗi candidate phải PASS:

```text
Dependency Gate
Locked Contract Impact Gate
```

Nếu FAIL:

```text
status = BLOCKED
```

Nếu PASS:

```text
status = ELIGIBLE
```

## Step 4 — Priority scoring

Chấm:

```text
Business Value       30%
Enablement Value     25%
Isolation            20%
Development Speed    15%
Regression Safety    10%
```

## Step 5 — Consultant recommendation

Consultant cung cấp:

- candidate list,
- dependency result,
- impact result,
- priority score,
- rủi ro,
- module được khuyến nghị.

## Step 6 — User decision

Người dùng quyết định:

```text
ELIGIBLE → ACTIVE
```

Consultant không tự mở module thay người dùng.

---

# 18. Definition of Done

Một module chỉ được `ACCEPTED` khi đạt **toàn bộ**:

### Specification

- [ ] Business flow đúng quyết định mới nhất đã chốt.
- [ ] Scope In/Out rõ.
- [ ] Không có current-scope action còn placeholder.

### Architecture

- [ ] Canonical domain type không bị phân mảnh.
- [ ] Page/component không gọi trực tiếp Firebase.
- [ ] Page/component không truy cập trực tiếp browser storage ngoài Demo service.
- [ ] Shared business logic nằm trong reusable domain/service.
- [ ] Data access đi qua DataProvider/Repository.
- [ ] Không thêm Electron/Tauri/native dependency trước Phase 12.

### UX & Validation

- [ ] Success notification rõ.
- [ ] Error/duplicate/required validation rõ.
- [ ] Không silent failure.
- [ ] UI không vỡ khi dữ liệu dài trong phạm vi test.

### Demo Data

- [ ] Demo seed đủ test.
- [ ] Migration đúng.
- [ ] Refresh/persistence đúng.
- [ ] Demo Reset hoạt động.

### Technical

- [ ] TypeScript/lint pass theo project scripts.
- [ ] Production Web build pass.
- [ ] Không Firebase request trong Demo.
- [ ] Không Gemini request trong Demo.

### Review

- [ ] Consultant Code Review PASS.
- [ ] Regression module ACCEPTED liên quan pass.
- [ ] Module không vượt approved scope.

### User Acceptance

- [ ] Consultant đã cung cấp Step-by-Step UI Acceptance Test.
- [ ] Người dùng đã trực tiếp test UI.
- [ ] Người dùng xác nhận `ĐẠT`.

### Git

- [ ] Có commit source đã nghiệm thu.
- [ ] Có checkpoint/tag tương ứng.
- [ ] `development-status.json` đồng bộ.

---

# 19. AI Scope Guard

Quy tắc bắt buộc trong mọi Prompt:

> Chỉ triển khai business module có status `ACTIVE`, hoặc sửa module `NEEDS_FIX` theo Prompt Fix/Change Request đã phê duyệt.

### ACCEPTED

Không sửa business behavior nếu không có Change Request.

### READY_FOR_ACCEPTANCE

Không thêm feature mới; chỉ chờ UI Acceptance hoặc fix lỗi phát hiện trong acceptance.

### ELIGIBLE

Không build. Chỉ là candidate đủ điều kiện.

### BLOCKED

Tuyệt đối không triển khai.

### ACTIVE

Chỉ triển khai approved scope.

### NEEDS_FIX

Chỉ sửa lỗi/change request của module đó, không mở module khác.

---

# 20. Change Management

## 20.1. Khi phát hiện yêu cầu mới trong lúc build

1. Không tự mở rộng.
2. Xác định thuộc:
   - current module,
   - accepted module,
   - future module.
3. Ghi rõ impact.
4. Chờ người dùng duyệt.

## 20.2. Khi UI Acceptance phát hiện thay đổi

Module:

```text
READY_FOR_ACCEPTANCE
        ↓
NEEDS_FIX
```

Consultant tạo Prompt Fix.

AI sửa xong → user push GitHub → Code Review lại → UI Acceptance lại.

## 20.3. Khi thay đổi module đã ACCEPTED

Tạo:

```text
CHANGE REQUEST <module> / CR-xx
```

Phải ghi:

- business reason,
- schema impact,
- migration impact,
- regression impact,
- module downstream bị ảnh hưởng.

Nếu thay đổi làm invalid checkpoint downstream, phải đánh giá và retest checkpoint đó.

Không silently modify locked module.

---

# 21. Regression Rule

Regression set không cố định theo số Module; nó được chọn theo **impact graph**.

Mỗi Code Review phải xác định:

```text
Changed Contract
      ↓
Affected Accepted Modules
      ↓
Required Regression Set
```

Baseline regression tối thiểu:

```text
Demo Reset
Navigation
Role Switcher
Development Roadmap Monitor
TypeScript/Lint
Build
```

Các module nghiệp vụ chỉ regression nếu source/contract của chúng có khả năng bị ảnh hưởng.

Ví dụ:

- Đổi Item schema → test Item + các module đọc Item.
- Đổi Project schema → test Project + BOM/Outbound/Monitoring liên quan.
- Đổi permission → test Sidebar + route guard + action permission.

---

# 22. Git Checkpoint Policy

Checkpoint mục tiêu:

```text
baseline-demo-stable
item-master-v1
project-core-v1
project-bom-v1
material-planning-v1
project-procurement-v1
project-receiving-v1
project-outbound-v1
material-monitoring-v1
management-dashboard-v1
transaction-history-v2
permission-review-v1
desktop-production-v1
```

Quy tắc:

1. Checkpoint chỉ tạo sau **User UI Acceptance = ĐẠT**.
2. Không tạo checkpoint chỉ vì AI build/lint pass.
3. Không rewrite lịch sử để xóa prototype cũ.
4. Cleanup bằng commit mới.
5. `ACCEPTED` checkpoint được xem là locked baseline.
6. Change Request sau checkpoint phải có commit mới và retest.
7. Không refactor module tiếp theo trước khi user chọn module ACTIVE.
8. Desktop packaging chỉ bắt đầu sau gate Phase 12.

---

# 23. Development Roadmap Monitor

Demo app phải có giao diện read-only:

```text
PHÁT TRIỂN · DEMO
  Tiến độ phát triển
```

Nguồn trạng thái:

```text
development-status.json
```

Monitor phải thể hiện:

- Accepted.
- Ready for Acceptance.
- Active.
- Needs Fix.
- Eligible.
- Blocked.
- Dependency.
- Checkpoint.
- Current Module.
- Web Demo progress.

### Locked indication

`ACCEPTED` phải có indicator:

```text
Đã chốt / Locked
```

### Eligible indication

`ELIGIBLE` nghĩa:

```text
Đủ điều kiện triển khai nhưng chưa được người dùng chọn.
```

### Không sửa status trên UI

Monitor là read-only.

Status thay đổi qua source/commit để có Git audit.

---

# 24. Quy trình phối hợp cố định

## Google AI Studio

Vai trò:

```text
Implementation Agent
```

- Build theo Prompt.
- Chạy test khả dụng.
- Báo file changed/test result.
- Không tự nghiệm thu.

## Người dùng

Vai trò:

```text
Product Owner / Final UI Acceptor
```

- Push code lên GitHub sau AI update.
- Test UI theo script.
- Quyết định ĐẠT/CHƯA ĐẠT.
- Chọn module tiếp theo từ candidate ELIGIBLE.

## Consultant / ChatGPT

Vai trò:

```text
Architecture + Code Review + Acceptance Design
```

- Review GitHub.
- Tìm blocker/regression/scope violation.
- Tạo Prompt Fix.
- Chỉ khi Code Review PASS mới cung cấp UI Acceptance Steps.
- Sau User Acceptance, đánh giá candidate module tiếp theo.
- Không tự thay quyết định UI của người dùng.

---

# 25. Thứ tự ưu tiên khi có xung đột

Nếu source/prompt/roadmap xung đột, ưu tiên:

```text
Quyết định mới nhất được người dùng phê duyệt
        ↓
Approved Change Request
        ↓
Approved Specification của module
        ↓
roadmap.md
        ↓
development-status.json về trạng thái runtime
        ↓
Giả định của AI
```

`development-status.json` không được ghi đè business specification; nó chỉ quản lý trạng thái triển khai.

Giả định của AI không được ghi đè business rule đã chốt.

---

# 26. Trạng thái Roadmap hiện tại

Tại thời điểm cập nhật Roadmap v3.0:

```text
MODULE 0 — Baseline Demo & Navigation            : ACCEPTED 🔒
MODULE 0.1 — Clean Baseline & Desktop Readiness  : ACCEPTED 🔒
MODULE 1 — Item Master + Master Data             : NEEDS_FIX / CHANGE REQUEST 01
MODULE 2 — Project Core                          : BLOCKED
MODULE 3 — BOM Management                        : BLOCKED
MODULE 4 — Material Planning                     : BLOCKED
MODULE 5 — Project Purchasing                    : BLOCKED
MODULE 6 — Project Receiving                     : BLOCKED
MODULE 7 — Project Outbound                      : BLOCKED
MODULE 8 — Material Monitoring                   : BLOCKED
MODULE 9 — Management Dashboard                  : BLOCKED
MODULE 10 — Transaction / Audit                  : BLOCKED
MODULE 11 — Permission Review                    : BLOCKED
PHASE 12 — Production Backend + Electron Desktop : BLOCKED
```

Current focus:

```text
MODULE 1 — CHANGE REQUEST 01
```

Các thay đổi chính đang chờ Google AI Studio triển khai/review:

```text
Bỏ SKU
Centered Item Detail Modal
Excel Item Import + Template Download
Notification / Validation UX
Supplier required fields
Basic Project Edit
3 Roles: ADMIN / MANAGER / ENGINEER
Role-based Sidebar Permission Mapping
Route Permission Guard
```

Module 2 không được mở cho đến khi Module 1 Change Request 01:

```text
AI Build
→ GitHub Push
→ Consultant Code Review PASS
→ User UI Acceptance = ĐẠT
→ item-master-v1 checkpoint
```

Sau checkpoint `item-master-v1`, **không mặc định mở Module 2**.

Thay vào đó phải thực hiện:

```text
Next Module Assessment
```

và người dùng chọn module `ELIGIBLE` tiếp theo.
