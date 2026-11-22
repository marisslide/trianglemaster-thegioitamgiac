import { ErrorDiagnosisCase } from '../types';

export const ERROR_DIAGNOSIS_CASES: ErrorDiagnosisCase[] = [
  {
    id: 'err_case_1',
    stageId: 3,
    stageCode: 'Bài 14',
    title: 'Nhầm lẫn trường hợp c.c.c thay vì c.g.c (Ví dụ mẫu trọng tâm)',
    topic: 'Hai tam giác bằng nhau – Trường hợp c.g.c',
    problem:
      'Cho tam giác ABC và tam giác DEF có AB = DE, BC = EF và góc B = góc E (∠B = ∠E). Hãy đọc lời giải dưới đây của một học sinh và xác định lỗi sai:',
    diagramData: {
      viewBox: '0 0 460 190',
      fills: [
        { vertices: ['A', 'B', 'C'], fill: '#FFF7ED' },
        { vertices: ['D', 'E', 'F'], fill: '#EFF6FF' },
      ],
      points: [
        { id: 'A', label: 'A', x: 108, y: 34, labelOffset: { dx: 0, dy: -14 } },
        { id: 'B', label: 'B', x: 42, y: 158, labelOffset: { dx: -16, dy: 6 } },
        { id: 'C', label: 'C', x: 196, y: 158, labelOffset: { dx: 16, dy: 6 } },
        { id: 'D', label: 'D', x: 338, y: 34, labelOffset: { dx: 0, dy: -14 } },
        { id: 'E', label: 'E', x: 272, y: 158, labelOffset: { dx: -16, dy: 6 } },
        { id: 'F', label: 'F', x: 426, y: 158, labelOffset: { dx: 16, dy: 6 } },
      ],
      segments: [
        { from: 'A', to: 'B', ticks: 1, color: '#2563EB' },
        { from: 'B', to: 'C', ticks: 2, color: '#14B8A6' },
        { from: 'A', to: 'C' },
        { from: 'D', to: 'E', ticks: 1, color: '#2563EB' },
        { from: 'E', to: 'F', ticks: 2, color: '#14B8A6' },
        { from: 'D', to: 'F' },
      ],
      angles: [
        { vertex: 'B', from: 'A', to: 'C', arcs: 1, color: '#F97316' },
        { vertex: 'E', from: 'D', to: 'F', arcs: 1, color: '#F97316' },
      ],
    },
    solutionSteps: [
      {
        stepNum: 1,
        title: 'Bước 1: Liệt kê các cạnh bằng nhau',
        content: 'Xét ΔABC và ΔDEF có: AB = DE (giả thiết) và BC = EF (giả thiết).',
      },
      {
        stepNum: 2,
        title: 'Bước 2: Nêu yếu tố góc bằng nhau',
        content: 'Lại có ∠B = ∠E (theo giả thiết đã cho).',
      },
      {
        stepNum: 3,
        title: 'Bước 3: Rút ra kết luận',
        content: 'Vậy ΔABC = ΔDEF theo trường hợp cạnh – cạnh – cạnh (c.c.c).',
      },
    ],
    wrongStepNum: 3,
    wrongReasonOptions: [
      'Bước 3 sai vì dữ kiện có 2 cặp cạnh bằng nhau và góc xen giữa bằng nhau, không có dữ kiện 3 cặp cạnh bằng nhau. Phải kết luận theo trường hợp c.g.c.',
      'Bước 1 sai vì AB không thể bằng DE trong tam giác thường.',
      'Bước 2 sai vì góc B và góc E là hai góc tù không thể bằng nhau.',
      'Bước 3 sai vì phải kết luận theo trường hợp g.c.g mới đúng.',
    ],
    correctReason:
      'Bước 3 sai vì dữ kiện có 2 cặp cạnh bằng nhau và góc xen giữa bằng nhau, không có dữ kiện 3 cặp cạnh bằng nhau. Phải kết luận theo trường hợp c.g.c.',
    correctionOptions: [
      'Sửa Bước 3 thành: "Vậy ΔABC = ΔDEF theo trường hợp cạnh – góc – cạnh (c.g.c)" vì góc B xen giữa AB, BC và góc E xen giữa DE, EF.',
      'Sửa Bước 1 bằng cách tự thêm AC = DF vào giả thiết để giữ nguyên c.c.c.',
      'Đổi tên tam giác thành ΔABC = ΔDFE (c.c.c).',
      'Chuyển cả bài sang chứng minh theo trường hợp tam giác vuông.',
    ],
    correctCorrection:
      'Sửa Bước 3 thành: "Vậy ΔABC = ΔDEF theo trường hợp cạnh – góc – cạnh (c.g.c)" vì góc B xen giữa AB, BC và góc E xen giữa DE, EF.',
    correctedSolution: [
      'Xét ΔABC và ΔDEF có:',
      '• AB = DE (theo giả thiết)',
      '• ∠B = ∠E (góc xen giữa hai cặp cạnh, theo giả thiết)',
      '• BC = EF (theo giả thiết)',
      '⇒ Kết luận: ΔABC = ΔDEF (c.g.c).',
    ],
    lessonLearned:
      'Ghi nhớ: Khi giải toán hình học, căn cứ kết luận phải khớp hoàn toàn với các dữ kiện đã nêu. Có 2 cạnh và góc xen giữa thì kết luận là (c.g.c), tuyệt đối không nhầm sang (c.c.c)!',
  },
  {
    id: 'err_case_2',
    stageId: 3,
    stageCode: 'Bài 14',
    title: 'Cạm bẫy góc không xen giữa (Lỗi ngộ nhận SSA)',
    topic: 'Hai tam giác bằng nhau – Trường hợp c.g.c',
    problem:
      'Cho ΔABC và ΔMNP có AB = MN, AC = MP và góc B = góc N (∠B = ∠N). Một bạn học sinh trình bày: "Vì có 2 cạnh bằng nhau và 1 góc bằng nhau nên ΔABC = ΔMNP (c.g.c)". Em hãy chỉ ra lỗi sai:',
    diagramData: {
      viewBox: '0 0 460 190',
      fills: [
        { vertices: ['A', 'B', 'C'], fill: '#FFF7ED' },
        { vertices: ['M', 'N', 'P'], fill: '#EFF6FF' },
      ],
      points: [
        { id: 'A', label: 'A', x: 108, y: 34, labelOffset: { dx: 0, dy: -14 } },
        { id: 'B', label: 'B', x: 42, y: 158, labelOffset: { dx: -16, dy: 6 } },
        { id: 'C', label: 'C', x: 196, y: 158, labelOffset: { dx: 16, dy: 6 } },
        { id: 'M', label: 'M', x: 338, y: 34, labelOffset: { dx: 0, dy: -14 } },
        { id: 'N', label: 'N', x: 272, y: 158, labelOffset: { dx: -16, dy: 6 } },
        { id: 'P', label: 'P', x: 426, y: 158, labelOffset: { dx: 16, dy: 6 } },
      ],
      segments: [
        { from: 'A', to: 'B', ticks: 1, color: '#2563EB' },
        { from: 'A', to: 'C', ticks: 2, color: '#14B8A6' },
        { from: 'B', to: 'C' },
        { from: 'M', to: 'N', ticks: 1, color: '#2563EB' },
        { from: 'M', to: 'P', ticks: 2, color: '#14B8A6' },
        { from: 'N', to: 'P' },
      ],
      angles: [
        { vertex: 'B', from: 'A', to: 'C', arcs: 1, color: '#EF4444', label: '∠B' },
        { vertex: 'N', from: 'M', to: 'P', arcs: 1, color: '#EF4444', label: '∠N' },
      ],
    },
    solutionSteps: [
      {
        stepNum: 1,
        title: 'Bước 1: Nêu hai cạnh bằng nhau',
        content: 'Có AB = MN và AC = MP theo giả thiết.',
      },
      {
        stepNum: 2,
        title: 'Bước 2: Nêu góc bằng nhau',
        content: 'Có ∠B = ∠N theo giả thiết.',
      },
      {
        stepNum: 3,
        title: 'Bước 3: Kết luận hai tam giác bằng nhau',
        content: 'Suy ra ΔABC = ΔMNP theo trường hợp cạnh – góc – cạnh (c.g.c).',
      },
    ],
    wrongStepNum: 3,
    wrongReasonOptions: [
      'Góc B và góc N không phải là góc xen giữa hai cạnh đã cho (góc xen giữa AB và AC phải là ∠A; giữa MN và MP phải là ∠M). Góc không xen giữa thì không áp dụng được trường hợp c.g.c!',
      'Bước 1 sai vì tam giác không thể có hai cạnh bằng nhau.',
      'Bước 2 sai vì góc B và góc N phải là góc vuông mới bằng nhau được.',
      'Cả hai tam giác này phải bằng nhau theo trường hợp g.c.g chứ không phải c.g.c.',
    ],
    correctReason:
      'Góc B và góc N không phải là góc xen giữa hai cạnh đã cho (góc xen giữa AB và AC phải là ∠A; giữa MN và MP phải là ∠M). Góc không xen giữa thì không áp dụng được trường hợp c.g.c!',
    correctionOptions: [
      'Cần bổ sung điều kiện góc xen giữa bằng nhau là ∠A = ∠M, khi đó mới đủ điều kiện kết luận ΔABC = ΔMNP (c.g.c).',
      'Đổi kết luận thành ΔABC = ΔMNP (c.c.c).',
      'Đo trực tiếp độ dài BC và NP bằng thước.',
      'Kết luận hai tam giác bằng nhau theo trường hợp cạnh huyền - góc nhọn.',
    ],
    correctCorrection:
      'Cần bổ sung điều kiện góc xen giữa bằng nhau là ∠A = ∠M, khi đó mới đủ điều kiện kết luận ΔABC = ΔMNP (c.g.c).',
    correctedSolution: [
      'Phân tích vị trí: Hai cạnh đã biết là AB và AC, điểm chung là A ⇒ Góc xen giữa bắt buộc phải là ∠A (∠BAC).',
      'Tương tự, MN và MP có điểm chung là M ⇒ Góc xen giữa bắt buộc phải là ∠M (∠NMP).',
      'Vì đề bài cho ∠B = ∠N (góc đối diện cạnh AC, MP, không xen giữa) nên CHƯA ĐỦ ĐIỀU KIỆN để kết luận hai tam giác bằng nhau.',
      '⇒ Để kết luận ΔABC = ΔMNP (c.g.c), cần phải có thêm dữ kiện ∠A = ∠M.',
    ],
    lessonLearned:
      'Quy tắc vàng: Tên trường hợp là c.g.c thì chữ "g" nằm GIỮA hai chữ "c". Do đó góc bắt buộc phải XEN GIỮA hai cạnh!',
  },
  {
    id: 'err_case_3',
    stageId: 1,
    stageCode: 'Bài 12',
    title: 'Nhầm lẫn giữa góc ngoài và góc trong của tam giác',
    topic: 'Tổng các góc trong một tam giác',
    problem:
      'Cho tam giác ABC có ∠A = 40° và ∠B = 60°. Một học sinh tính số đo góc ngoài tại đỉnh C (kí hiệu là ∠ACx) như sau: "∠ACx = 180° − (40° + 60°) = 80°". Hãy phát hiện lỗi sai:',
    solutionSteps: [
      {
        stepNum: 1,
        title: 'Bước 1: Lấy 180° trừ đi tổng hai góc A và B',
        content: 'Ta có: 180° − (∠A + ∠B) = 180° − (40° + 60°) = 80°.',
      },
      {
        stepNum: 2,
        title: 'Bước 2: Kết luận số đo góc ngoài',
        content: 'Vậy số đo góc ngoài tại đỉnh C là ∠ACx = 80°.',
      },
    ],
    wrongStepNum: 2,
    wrongReasonOptions: [
      '80° là số đo của góc TRONG tại đỉnh C (∠ACB), không phải góc NGOÀI. Góc ngoài tại đỉnh C bằng tổng hai góc trong không kề với nó: ∠ACx = ∠A + ∠B = 40° + 60° = 100°.',
      'Tổng ba góc trong tam giác bằng 360° nên tính bằng 180° là sai.',
      'Góc ngoài tam giác luôn luôn bằng 90°.',
      'Góc A và góc B phải bằng nhau thì mới tính được góc ngoài.',
    ],
    correctReason:
      '80° là số đo của góc TRONG tại đỉnh C (∠ACB), không phải góc NGOÀI. Góc ngoài tại đỉnh C bằng tổng hai góc trong không kề với nó: ∠ACx = ∠A + ∠B = 40° + 60° = 100°.',
    correctionOptions: [
      'Áp dụng định lí: Mỗi góc ngoài của một tam giác có số đo bằng tổng số đo hai góc trong không kề với nó: ∠ACx = ∠A + ∠B = 40° + 60° = 100° (hoặc ∠ACx = 180° − ∠ACB = 180° − 80° = 100°).',
      'Đổi kết quả thành 80° + 180° = 260°.',
      'Góc ngoài tại đỉnh C bằng góc A trừ đi góc B: 60° − 40° = 20°.',
      'Không thể tính được góc ngoài khi chưa biết cạnh.',
    ],
    correctCorrection:
      'Áp dụng định lí: Mỗi góc ngoài của một tam giác có số đo bằng tổng số đo hai góc trong không kề với nó: ∠ACx = ∠A + ∠B = 40° + 60° = 100° (hoặc ∠ACx = 180° − ∠ACB = 180° − 80° = 100°).',
    correctedSolution: [
      'Cách 1 (Nhanh nhất):',
      'Góc ngoài tại đỉnh C của ΔABC bằng tổng hai góc trong không kề với nó:',
      '∠ACx = ∠A + ∠B = 40° + 60° = 100°.',
      'Cách 2:',
      'Góc trong ∠ACB = 180° − 40° − 60° = 80°.',
      'Vì ∠ACx kề bù với ∠ACB nên: ∠ACx = 180° − 80° = 100°.',
    ],
    lessonLearned:
      'Phân biệt rõ: 180° − (tổng 2 góc) = GÓC TRONG thứ ba. Còn GÓC NGOÀI = TỔNG 2 góc trong không kề!',
  },
  {
    id: 'err_case_4',
    stageId: 2,
    stageCode: 'Bài 13',
    title: 'Viết sai thứ tự đỉnh tương ứng khi kết luận tam giác bằng nhau',
    topic: 'Hai tam giác bằng nhau – Trường hợp c.c.c',
    problem:
      'Cho ΔABC và ΔDEF có AB = DF, BC = FE và AC = DE. Một học sinh kết luận ngay: "ΔABC = ΔDEF (c.c.c)". Lời kết luận này sai ở đâu?',
    solutionSteps: [
      {
        stepNum: 1,
        title: 'Bước 1: Liệt kê các cạnh bằng nhau',
        content: 'Xét ΔABC và ΔDEF có: AB = DF, BC = FE, AC = DE (theo giả thiết).',
      },
      {
        stepNum: 2,
        title: 'Bước 2: Kết luận hai tam giác bằng nhau',
        content: 'Suy ra ΔABC = ΔDEF (c.c.c).',
      },
    ],
    wrongStepNum: 2,
    wrongReasonOptions: [
      'Kí hiệu thứ tự đỉnh bị sai: Đỉnh A tương ứng với D, B tương ứng với F, C tương ứng với E. Viết đúng phải là ΔABC = ΔDFE.',
      'Hai tam giác này không bằng nhau vì các chữ cái khác nhau.',
      'Phải viết là ΔABC = ΔEDF mới đúng.',
      'Trường hợp c.c.c không cần quan tâm đến thứ tự đỉnh.',
    ],
    correctReason:
      'Kí hiệu thứ tự đỉnh bị sai: Đỉnh A tương ứng với D, B tương ứng với F, C tương ứng với E. Viết đúng phải là ΔABC = ΔDFE.',
    correctionOptions: [
      'Xác định đúng các cặp đỉnh tương ứng: A ↔ D, B ↔ F, C ↔ E và sửa kết luận thành ΔABC = ΔDFE (c.c.c).',
      'Đổi tên cạnh AB thành DE để giữ nguyên ΔABC = ΔDEF.',
      'Không dùng kí hiệu dấu "=" mà viết bằng lời.',
      'Đảo ngược cả 3 đỉnh thành ΔCBA = ΔDEF.',
    ],
    correctCorrection:
      'Xác định đúng các cặp đỉnh tương ứng: A ↔ D, B ↔ F, C ↔ E và sửa kết luận thành ΔABC = ΔDFE (c.c.c).',
    correctedSolution: [
      'Tìm các cặp đỉnh tương ứng:',
      '• Đỉnh A chung của AB, AC ↔ Đỉnh D chung của DF, DE ⇒ A ↔ D.',
      '• Đỉnh B chung của AB, BC ↔ Đỉnh F chung của DF, FE ⇒ B ↔ F.',
      '• Đỉnh C chung của BC, AC ↔ Đỉnh E chung của FE, DE ⇒ C ↔ E.',
      '⇒ Kết luận đúng: ΔABC = ΔDFE (c.c.c).',
    ],
    lessonLearned:
      'Khi viết kí hiệu hai tam giác bằng nhau, tên các đỉnh tương ứng BẮT BUỘC phải đặt ở vị trí tương ứng!',
  },
  {
    id: 'err_case_5',
    stageId: 4,
    stageCode: 'Bài 15',
    title: 'Nhầm lẫn cạnh góc vuông với cạnh huyền trong tam giác vuông',
    topic: 'Các trường hợp bằng nhau của tam giác vuông',
    problem:
      'Cho ΔABC vuông tại A và ΔDEF vuông tại D có AB = EF và ∠B = ∠E. Bạn An kết luận: "ΔABC = ΔDEF theo trường hợp cạnh huyền – góc nhọn". Lỗi sai của An là gì?',
    solutionSteps: [
      {
        stepNum: 1,
        title: 'Bước 1: Nhận diện hai tam giác vuông',
        content: 'ΔABC vuông tại A (∠A = 90°) và ΔDEF vuông tại D (∠D = 90°).',
      },
      {
        stepNum: 2,
        title: 'Bước 2: So sánh cạnh và góc',
        content: 'Có AB = EF và ∠B = ∠E theo giả thiết.',
      },
      {
        stepNum: 3,
        title: 'Bước 3: Kết luận',
        content: 'Suy ra ΔABC = ΔDEF theo trường hợp cạnh huyền – góc nhọn.',
      },
    ],
    wrongStepNum: 3,
    wrongReasonOptions: [
      'An đã nhầm cạnh góc vuông với cạnh huyền: Trong ΔABC vuông tại A thì AB là cạnh góc vuông, còn trong ΔDEF vuông tại D thì EF là cạnh huyền. Không thể so sánh một cạnh góc vuông với một cạnh huyền để kết luận trường hợp cạnh huyền - góc nhọn!',
      'Góc B và góc E là góc tù không thể là góc nhọn.',
      'Hai tam giác vuông chỉ bằng nhau khi cả ba cạnh bằng nhau.',
      'Trường hợp cạnh huyền - góc nhọn không tồn tại trong hình học 7.',
    ],
    correctReason:
      'An đã nhầm cạnh góc vuông với cạnh huyền: Trong ΔABC vuông tại A thì AB là cạnh góc vuông, còn trong ΔDEF vuông tại D thì EF là cạnh huyền. Không thể so sánh một cạnh góc vuông với một cạnh huyền để kết luận trường hợp cạnh huyền - góc nhọn!',
    correctionOptions: [
      'Cần xác định đúng: cạnh huyền của ΔABC phải là BC. Để dùng trường hợp cạnh huyền – góc nhọn, giả thiết phải cho BC = EF (cùng là cạnh huyền) và ∠B = ∠E.',
      'Sửa thành trường hợp hai cạnh góc vuông.',
      'Đổi góc vuông A thành góc nhọn.',
      'Chuyển sang đo diện tích hai tam giác.',
    ],
    correctCorrection:
      'Cần xác định đúng: cạnh huyền của ΔABC phải là BC. Để dùng trường hợp cạnh huyền – góc nhọn, giả thiết phải cho BC = EF (cùng là cạnh huyền) và ∠B = ∠E.',
    correctedSolution: [
      'Phân tích vai trò cạnh trong tam giác vuông:',
      '• ΔABC vuông tại A ⇒ Cạnh huyền là BC (đối diện góc vuông A); AB, AC là hai cạnh góc vuông.',
      '• ΔDEF vuông tại D ⇒ Cạnh huyền là EF (đối diện góc vuông D); DE, DF là hai cạnh góc vuông.',
      'Vì AB (cạnh góc vuông) = EF (cạnh huyền) nên hai cạnh này KHÔNG CÙNG VAI TRÒ TƯƠNG ỨNG.',
      '⇒ Chưa đủ điều kiện kết luận hai tam giác vuông bằng nhau.',
    ],
    lessonLearned:
      'Trong tam giác vuông: Cạnh huyền phải so với cạnh huyền, cạnh góc vuông phải so với cạnh góc vuông!',
  },
  {
    id: 'err_case_6',
    stageId: 5,
    stageCode: 'Bài 16',
    title: 'Nhầm lẫn giữa trung điểm và điểm thuộc đường trung trực',
    topic: 'Tam giác cân. Đường trung trực của đoạn thẳng',
    problem:
      'Cho đoạn thẳng AB và điểm M thỏa mãn MA = MB = 5 cm. Một học sinh suy luận: "Vì MA = MB nên điểm M chính là trung điểm của đoạn thẳng AB". Hãy chỉ ra lỗi sai trong suy luận:',
    solutionSteps: [
      {
        stepNum: 1,
        title: 'Bước 1: Nêu điều kiện khoảng cách bằng nhau',
        content: 'Ta có MA = MB = 5 cm (điểm M cách đều hai điểm A và B).',
      },
      {
        stepNum: 2,
        title: 'Bước 2: Rút ra kết luận',
        content: 'Suy ra M là trung điểm của đoạn thẳng AB.',
      },
    ],
    wrongStepNum: 2,
    wrongReasonOptions: [
      'MA = MB chỉ chứng tỏ M nằm trên ĐƯỜNG TRUNG TRỰC của AB. Điểm M chỉ là trung điểm nếu M NẰM TRÊN đoạn thẳng AB (M nằm giữa A và B). Nếu M nằm ngoài đường thẳng AB thì M không phải trung điểm!',
      'Trung điểm phải cách đều hai đầu mút 10 cm chứ không phải 5 cm.',
      'Điểm M không thể cách đều hai đầu mút của một đoạn thẳng.',
      'MA = MB chứng tỏ tam giác MAB là tam giác vuông.',
    ],
    correctReason:
      'MA = MB chỉ chứng tỏ M nằm trên ĐƯỜNG TRUNG TRỰC của AB. Điểm M chỉ là trung điểm nếu M NẰM TRÊN đoạn thẳng AB (M nằm giữa A và B). Nếu M nằm ngoài đường thẳng AB thì M không phải trung điểm!',
    correctionOptions: [
      'Sửa kết luận thành: "Suy ra điểm M nằm trên đường trung trực của đoạn thẳng AB. M chỉ là trung điểm của AB khi M đồng thời thuộc đoạn thẳng AB".',
      'Sửa thành M là trọng tâm của đoạn thẳng AB.',
      'Khẳng định M là đỉnh của tam giác đều.',
      'Thêm điều kiện AB = 5 cm.',
    ],
    correctCorrection:
      'Sửa kết luận thành: "Suy ra điểm M nằm trên đường trung trực của đoạn thẳng AB. M chỉ là trung điểm của AB khi M đồng thời thuộc đoạn thẳng AB".',
    correctedSolution: [
      'Định nghĩa đúng:',
      '• Trung điểm của đoạn thẳng AB là điểm NẰM GIỮA A, B và CÁCH ĐỀU A, B (MA + MB = AB và MA = MB).',
      '• Định lí đường trung trực: Điểm cách đều hai đầu mút của một đoạn thẳng thì NẰM TRÊN ĐƯỜNG TRUNG TRỰC của đoạn thẳng đó.',
      'Nếu M nằm ngoài đoạn thẳng AB sao cho MA = MB thì ΔMAB là tam giác cân tại M, khi đó M không phải là trung điểm của AB!',
    ],
    lessonLearned:
      'Khoảng cách MA = MB chỉ đảm bảo M thuộc đường trung trực. Muốn là trung điểm thì M BẮT BUỘC phải nằm giữa A và B!',
  },
  {
    id: 'err_case_7',
    stageId: 5,
    stageCode: 'Bài 16',
    title: 'Ngộ nhận tam giác có một góc 60° là tam giác đều',
    topic: 'Tam giác cân. Tam giác đều',
    problem:
      'Cho tam giác MNP có ∠M = 60°. Một bạn học sinh kết luận: "ΔMNP là tam giác đều vì có một góc bằng 60°". Lời kết luận này thiếu sót gì?',
    solutionSteps: [
      {
        stepNum: 1,
        title: 'Bước 1: Nêu số đo góc M',
        content: 'Tam giác MNP có ∠M = 60° theo giả thiết.',
      },
      {
        stepNum: 2,
        title: 'Bước 2: Kết luận tam giác đều',
        content: 'Vậy ΔMNP là tam giác đều.',
      },
    ],
    wrongStepNum: 2,
    wrongReasonOptions: [
      'Dấu hiệu nhận biết tam giác đều yêu cầu: "Tam giác CÂN có một góc bằng 60° mới là tam giác đều". Một tam giác bất kì chỉ có một góc 60° (ví dụ 60°, 80°, 40°) thì KHÔNG PHẢI là tam giác đều!',
      'Góc 60° phải là góc vuông thì tam giác mới đều.',
      'Tam giác đều phải có góc ở đỉnh bằng 90°.',
      'Không thể có tam giác nào có góc bằng 60°.',
    ],
    correctReason:
      'Dấu hiệu nhận biết tam giác đều yêu cầu: "Tam giác CÂN có một góc bằng 60° mới là tam giác đều". Một tam giác bất kì chỉ có một góc 60° (ví dụ 60°, 80°, 40°) thì KHÔNG PHẢI là tam giác đều!',
    correctionOptions: [
      'Cần bổ sung điều kiện ΔMNP cân (ví dụ MN = MP hoặc ∠N = ∠P) kết hợp với ∠M = 60° thì mới kết luận được ΔMNP là tam giác đều.',
      'Đổi kết luận thành ΔMNP là tam giác vuông.',
      'Tính chu vi trước rồi mới kết luận.',
      'Đổi góc 60° thành 45°.',
    ],
    correctCorrection:
      'Cần bổ sung điều kiện ΔMNP cân (ví dụ MN = MP hoặc ∠N = ∠P) kết hợp với ∠M = 60° thì mới kết luận được ΔMNP là tam giác đều.',
    correctedSolution: [
      'Dấu hiệu nhận biết tam giác đều chuẩn Toán 7:',
      '1. Tam giác có ba cạnh bằng nhau là tam giác đều.',
      '2. Tam giác có ba góc bằng nhau (mỗi góc bằng 60°) là tam giác đều.',
      '3. Tam giác CÂN có một góc bằng 60° là tam giác đều.',
      'Ở đây ΔMNP chưa có điều kiện cân (chưa biết hai cạnh bên nào bằng nhau), do đó chưa thể kết luận là tam giác đều.',
    ],
    lessonLearned:
      'Cực kì quan trọng: Phải là TAM GIÁC CÂN có một góc 60° thì mới đều. Tam giác thường có góc 60° vẫn có thể lệch!',
  },
];

export function getErrorCaseById(id: string): ErrorDiagnosisCase | undefined {
  return ERROR_DIAGNOSIS_CASES.find((c) => c.id === id);
}
