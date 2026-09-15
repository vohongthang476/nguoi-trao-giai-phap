(function () {
  "use strict";

  const catalog = {
    math: {
      2: [
        ["all", "Tổng hợp Toán lớp 2"], ["cong-tru", "Cộng, trừ"], ["nhan-chia", "Làm quen nhân, chia"],
        ["do-luong", "Độ dài, khối lượng, thời gian"], ["hinh-hoc", "Hình học"], ["loi-van", "Bài toán có lời văn"]
      ],
      3: [
        ["all", "Tổng hợp Toán lớp 3"], ["so-phep-tinh", "Số và phép tính"], ["nhan-chia", "Nhân, chia"],
        ["phan-so", "Làm quen phân số"], ["do-luong", "Đo lường"], ["loi-van", "Bài toán có lời văn"]
      ],
      4: [
        ["all", "Tổng hợp Toán lớp 4"], ["so-tu-nhien", "Số tự nhiên"], ["nhan-chia", "Nhân, chia"],
        ["phan-so", "Phân số"], ["hinh-hoc", "Hình học"], ["loi-van", "Bài toán có lời văn"]
      ],
      5: [
        ["all", "Tổng hợp Toán lớp 5"], ["so-thap-phan", "Số thập phân"], ["phan-so", "Phân số"],
        ["don-vi", "Đổi đơn vị"], ["phan-tram", "Tỉ số phần trăm"], ["hinh-hoc", "Hình học"]
      ]
    },
    vietnamese: {
      2: [
        ["all", "Tổng hợp Tiếng Việt lớp 2"], ["chinh-ta", "Chính tả"], ["tu-ngu", "Từ ngữ"],
        ["cau", "Câu"], ["dau-cau", "Dấu câu"], ["doc-hieu", "Đọc hiểu"]
      ],
      3: [
        ["all", "Tổng hợp Tiếng Việt lớp 3"], ["chinh-ta", "Chính tả"], ["tu-loai", "Từ chỉ sự vật, hoạt động, đặc điểm"],
        ["cau", "Kiểu câu"], ["dau-cau", "Dấu câu"], ["doc-hieu", "Đọc hiểu"]
      ],
      4: [
        ["all", "Tổng hợp Tiếng Việt lớp 4"], ["danh-tu", "Danh từ"], ["dong-tu", "Động từ"],
        ["tinh-tu", "Tính từ"], ["cau", "Câu và thành phần câu"], ["doc-hieu", "Đọc hiểu"]
      ],
      5: [
        ["all", "Tổng hợp Tiếng Việt lớp 5"], ["tu-nghia", "Từ đồng nghĩa, trái nghĩa"], ["dai-tu", "Đại từ, quan hệ từ"],
        ["lien-ket", "Liên kết câu"], ["dau-cau", "Dấu câu"], ["doc-hieu", "Đọc hiểu"]
      ]
    }
  };

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = arr => arr[rand(0, arr.length - 1)];
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  const fmt = n => Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100).replace(".", ",");
  const textQ = (prompt, answer, explanation) => ({ prompt, type: "text", answer: String(answer), explanation });
  const choiceQ = (prompt, answer, distractors, explanation) => {
    const opts = shuffle([String(answer), ...distractors.map(String)].filter((v, i, a) => a.indexOf(v) === i)).slice(0, 4);
    if (!opts.includes(String(answer))) opts[0] = String(answer);
    return { prompt, type: "choice", options: shuffle(opts), answer: String(answer), explanation };
  };

  function rangeFor(grade, level) {
    const base = { 2: 100, 3: 1000, 4: 100000, 5: 1000000 }[grade];
    return level === "basic" ? Math.max(20, Math.floor(base / 10)) : level === "challenge" ? base : Math.floor(base / 2);
  }

  function mathQuestion(grade, topic, level) {
    const max = rangeFor(grade, level);
    const effective = topic === "all" ? pick(catalog.math[grade].slice(1))[0] : topic;
    let a, b, answer, unit, price, qty, total;

    if (effective === "cong-tru" || effective === "so-phep-tinh" || effective === "so-tu-nhien") {
      a = rand(Math.max(5, Math.floor(max / 8)), Math.max(10, Math.floor(max * .7)));
      b = rand(2, Math.max(5, Math.floor(max * .3)));
      const subtract = Math.random() > .5;
      if (subtract && b > a) [a, b] = [b, a];
      answer = subtract ? a - b : a + b;
      return choiceQ(`Tính: ${a.toLocaleString("vi-VN")} ${subtract ? "−" : "+"} ${b.toLocaleString("vi-VN")} = ?`, answer,
        [answer + rand(1, 9), Math.max(0, answer - rand(1, 9)), subtract ? a + b : Math.abs(a - b)],
        `${a.toLocaleString("vi-VN")} ${subtract ? "−" : "+"} ${b.toLocaleString("vi-VN")} = ${answer.toLocaleString("vi-VN")}.`);
    }

    if (effective === "nhan-chia") {
      const factorMax = grade === 2 ? 5 : grade === 3 ? 10 : level === "challenge" ? 99 : 20;
      a = rand(2, factorMax); b = rand(2, grade <= 3 ? 10 : 25);
      const divide = Math.random() > .55;
      answer = divide ? b : a * b;
      const prompt = divide ? `${a * b} : ${a} = ?` : `${a} × ${b} = ?`;
      return choiceQ(`Tính: ${prompt}`, answer, [answer + a, Math.max(1, answer - a), a + b],
        divide ? `Vì ${a} × ${b} = ${a * b} nên ${a * b} : ${a} = ${b}.` : `${a} × ${b} = ${answer}.`);
    }

    if (effective === "phan-so") {
      const den = pick([2, 3, 4, 5, 6, 8, 10]);
      const num = rand(1, den - 1);
      if (grade === 3) return choiceQ(`Một hình được chia thành ${den} phần bằng nhau, tô màu ${num} phần. Phân số chỉ phần đã tô là:`,
        `${num}/${den}`, [`${den}/${num}`, `${num}/${den + 1}`, `${num + 1}/${den}`], `Tử số là số phần tô màu; mẫu số là tổng số phần bằng nhau.`);
      const multiplier = rand(2, 5);
      return choiceQ(`Phân số nào bằng ${num}/${den}?`, `${num * multiplier}/${den * multiplier}`,
        [`${num + multiplier}/${den + multiplier}`, `${num * multiplier}/${den}`, `${num}/${den * multiplier}`],
        `Nhân cả tử và mẫu của ${num}/${den} với ${multiplier}.`);
    }

    if (effective === "do-luong" || effective === "don-vi") {
      if (grade <= 3) {
        unit = pick([["m", "cm", 100], ["kg", "g", 1000], ["giờ", "phút", 60]]);
        a = rand(2, level === "challenge" ? 9 : 5);
        answer = a * unit[2];
        return choiceQ(`${a} ${unit[0]} bằng bao nhiêu ${unit[1]}?`, answer,
          [a + unit[2], answer / 10, answer + unit[2]], `1 ${unit[0]} = ${unit[2]} ${unit[1]}, nên ${a} ${unit[0]} = ${answer} ${unit[1]}.`);
      }
      unit = pick([["km", "m", 1000], ["m", "cm", 100], ["kg", "g", 1000]]);
      a = rand(2, 15);
      answer = a * unit[2];
      return textQ(`Điền số thích hợp: ${a} ${unit[0]} = ___ ${unit[1]}.`, answer,
        `Nhân ${a} với ${unit[2]}: kết quả là ${answer} ${unit[1]}.`);
    }

    if (effective === "so-thap-phan") {
      a = rand(10, 250) / 10; b = rand(5, 120) / 10;
      const subtract = Math.random() > .5;
      if (subtract && b > a) [a, b] = [b, a];
      answer = subtract ? a - b : a + b;
      return textQ(`Tính: ${fmt(a)} ${subtract ? "−" : "+"} ${fmt(b)} = ?`, fmt(answer),
        `Đặt thẳng hàng các dấu phẩy rồi tính: kết quả là ${fmt(answer)}.`);
    }

    if (effective === "phan-tram") {
      const percent = pick([10, 20, 25, 50, 75]);
      total = pick([40, 80, 100, 120, 200, 400]);
      answer = total * percent / 100;
      return choiceQ(`${percent}% của ${total} là bao nhiêu?`, answer,
        [total - answer, percent, answer + 10], `${total} × ${percent} : 100 = ${answer}.`);
    }

    if (effective === "hinh-hoc") {
      if (grade === 2) {
        const shape = pick([
          ["hình tam giác", "3 cạnh", ["4 cạnh", "không có cạnh", "5 cạnh"]],
          ["hình tứ giác", "4 cạnh", ["3 cạnh", "5 cạnh", "không có cạnh"]],
          ["hình tròn", "không có cạnh", ["3 cạnh", "4 cạnh", "1 cạnh"]]
        ]);
        return choiceQ(`${shape[0][0].toUpperCase() + shape[0].slice(1)} có đặc điểm nào?`, shape[1], shape[2], `${shape[0]} ${shape[1]}.`);
      }
      a = rand(3, level === "challenge" ? 30 : 15); b = rand(2, level === "challenge" ? 20 : 12);
      if (grade === 3 || Math.random() > .45) {
        answer = (a + b) * 2;
        return textQ(`Một hình chữ nhật dài ${a} cm, rộng ${b} cm. Chu vi hình đó là bao nhiêu xăng-ti-mét?`, answer,
          `Chu vi = (dài + rộng) × 2 = (${a} + ${b}) × 2 = ${answer} cm.`);
      }
      answer = a * b;
      return textQ(`Một hình chữ nhật dài ${a} cm, rộng ${b} cm. Diện tích là bao nhiêu xăng-ti-mét vuông?`, answer,
        `Diện tích = dài × rộng = ${a} × ${b} = ${answer} cm².`);
    }

    price = rand(2, grade <= 2 ? 9 : 25) * 1000; qty = rand(2, grade <= 2 ? 5 : 12); total = price * qty;
    const contexts = [
      `Mỗi quyển vở giá ${price.toLocaleString("vi-VN")} đồng. Mua ${qty} quyển hết bao nhiêu đồng?`,
      `Mỗi hộp có ${qty} chiếc bút. ${Math.max(2, Math.floor(price / 1000))} hộp có tất cả bao nhiêu chiếc bút?`
    ];
    if (Math.random() > .5) return textQ(contexts[0], total, `${price.toLocaleString("vi-VN")} × ${qty} = ${total.toLocaleString("vi-VN")} đồng.`);
    a = Math.max(2, Math.floor(price / 1000)); answer = a * qty;
    return textQ(contexts[1], answer, `${qty} × ${a} = ${answer} chiếc bút.`);
  }

  const vnBank = {
    2: {
      "chinh-ta": [
        ["Từ nào viết đúng chính tả?", "chăm chỉ", ["chăm chĩ", "trăm chỉ", "chăm chỷ"], "Từ đúng là “chăm chỉ”."],
        ["Điền “ng” hoặc “ngh”: ___ỉ hè.", "ngh", ["ng", "g", "gh"], "Trước âm i, viết “ngh”: nghỉ hè."],
        ["Từ nào viết đúng?", "xinh xắn", ["sinh sắn", "xinh sắn", "sinh xắn"], "Từ đúng là “xinh xắn”."],
        ["Điền “ch” hoặc “tr”: cây ___e.", "tr", ["ch", "s", "x"], "Viết “cây tre” với âm đầu tr."],
        ["Từ nào có vần “ươn”?", "vườn cây", ["con đường", "mái trường", "dòng sông"], "“Vườn” có vần ươn."],
        ["Điền “c” hoặc “k”: ___ể chuyện.", "k", ["c", "q", "g"], "Trước âm ê, viết k: kể chuyện."]
      ],
      "tu-ngu": [
        ["Từ nào chỉ sự vật?", "cây bàng", ["chạy", "xanh", "nhanh"], "“Cây bàng” gọi tên một sự vật."],
        ["Từ nào chỉ hoạt động?", "đọc sách", ["quyển sách", "chăm chỉ", "màu đỏ"], "“Đọc sách” là một hoạt động."],
        ["Từ nào chỉ đặc điểm?", "cao", ["bạn Lan", "nhảy dây", "cái bàn"], "“Cao” nêu đặc điểm."],
        ["Nhóm nào đều là từ chỉ con vật?", "mèo, gà, thỏ", ["bàn, ghế, tủ", "cam, bưởi, nhãn", "đỏ, xanh, vàng"], "Mèo, gà, thỏ đều là con vật."],
        ["Từ nào chỉ người?", "bác sĩ", ["bệnh viện", "chữa bệnh", "sạch sẽ"], "“Bác sĩ” là từ chỉ người."],
        ["Từ nào chỉ hoạt động học tập?", "viết bài", ["bút chì", "ngay ngắn", "lớp học"], "“Viết bài” là hoạt động học tập."]
      ],
      "cau": [
        ["Dòng nào là một câu hoàn chỉnh?", "Bé đang đọc sách.", ["Đang đọc sách", "Bé đang", "Quyển sách và"], "Câu hoàn chỉnh diễn đạt trọn ý."],
        ["Câu “Mẹ là giáo viên.” thuộc mẫu nào?", "Ai là gì?", ["Ai làm gì?", "Ai thế nào?", "Khi nào?"], "Câu giới thiệu mẹ là giáo viên."],
        ["Câu “Chú mèo rất ngoan.” thuộc mẫu nào?", "Ai thế nào?", ["Ai làm gì?", "Ai là gì?", "Ở đâu?"], "Câu nêu đặc điểm của chú mèo."],
        ["Câu “Nam đá bóng.” thuộc mẫu nào?", "Ai làm gì?", ["Ai là gì?", "Ai thế nào?", "Vì sao?"], "Câu nêu hoạt động của Nam."],
        ["Từ nào thích hợp: “Bầu trời ___ xanh.”", "rất", ["đã", "ở", "và"], "“Rất xanh” là cụm từ phù hợp."],
        ["Sắp xếp đúng: “sân / các bạn / chơi / ở trường”", "Các bạn chơi ở sân trường.", ["Chơi các bạn ở sân trường.", "Sân trường ở các bạn chơi.", "Ở chơi sân trường các bạn."], "Câu đúng cần có người thực hiện và hoạt động."]
      ],
      "dau-cau": [
        ["Cuối câu kể dùng dấu gì?", "Dấu chấm", ["Dấu hỏi", "Dấu phẩy", "Dấu hai chấm"], "Câu kể thường kết thúc bằng dấu chấm."],
        ["Cuối câu “Bạn tên là gì___” điền dấu nào?", "?", [".", ",", ":"], "Đây là câu hỏi nên dùng dấu hỏi."],
        ["Câu “Ôi, bông hoa đẹp quá___” cần dấu nào?", "!", [".", "?", ","], "Câu bộc lộ cảm xúc dùng dấu chấm than."],
        ["Dấu nào ngăn cách các từ trong phép liệt kê?", "Dấu phẩy", ["Dấu hỏi", "Dấu chấm", "Dấu gạch ngang"], "Dấu phẩy ngăn cách các sự vật được liệt kê."],
        ["Chọn câu đặt dấu đúng.", "Lan, Mai và Hà cùng trực nhật.", ["Lan Mai, và Hà cùng trực nhật.", "Lan Mai và, Hà cùng trực nhật.", "Lan Mai và Hà, cùng trực nhật."], "Dấu phẩy ngăn cách các tên trong liệt kê."],
        ["Câu nào là câu hỏi?", "Hôm nay bạn có vui không?", ["Hôm nay em rất vui.", "Bạn hãy vui lên!", "Ôi, thật vui!"], "Câu hỏi dùng để hỏi và kết thúc bằng dấu hỏi."]
      ],
      "doc-hieu": [
        ["<p class=\"passage\">Sáng sớm, chim sẻ chuyền cành và hót líu lo. Bé Na mở cửa, mỉm cười chào ngày mới.</p>Ai hót líu lo?", "Chim sẻ", ["Bé Na", "Ngày mới", "Cành cây"], "Đoạn văn nói chim sẻ hót líu lo."],
        ["<p class=\"passage\">Nam tưới cây mỗi chiều. Nhờ được chăm sóc, cây hoa giấy nở rực trước hiên nhà.</p>Nam làm gì mỗi chiều?", "Tưới cây", ["Hái hoa", "Quét nhà", "Đọc sách"], "Câu đầu cho biết Nam tưới cây mỗi chiều."],
        ["<p class=\"passage\">Mưa tạnh. Trên bầu trời, chiếc cầu vồng bảy sắc hiện ra thật đẹp.</p>Cầu vồng xuất hiện khi nào?", "Sau khi mưa tạnh", ["Trước cơn mưa", "Giữa trưa nắng", "Vào ban đêm"], "Đoạn văn mở đầu bằng việc mưa đã tạnh."],
        ["<p class=\"passage\">Giờ ra chơi, Lan thấy một chiếc bút rơi. Em nhặt lên và đem nộp cô giáo.</p>Việc làm của Lan cho thấy điều gì?", "Lan thật thà", ["Lan ích kỉ", "Lan lười biếng", "Lan nhút nhát"], "Nhặt được của rơi và nộp lại là hành động thật thà."],
        ["<p class=\"passage\">Bà kể chuyện cổ tích. Giọng bà ấm áp đưa em vào giấc ngủ ngon.</p>Giọng bà được tả thế nào?", "Ấm áp", ["Ồn ào", "Lạnh lùng", "Vội vàng"], "Từ “ấm áp” miêu tả giọng bà."],
        ["<p class=\"passage\">Trong vườn, đàn bướm bay quanh những khóm hoa. Cánh bướm đủ màu rung rinh trong nắng.</p>Đàn bướm bay ở đâu?", "Trong vườn", ["Trong lớp", "Ngoài biển", "Trên mái nhà"], "Cụm từ đầu đoạn xác định nơi đàn bướm bay."]
      ]
    },
    3: {
      "chinh-ta": [
        ["Từ nào viết đúng?", "gọn gàng", ["gọn gàn", "gọn ghàng", "gọn gànng"], "Từ đúng là “gọn gàng”."],
        ["Điền s hoặc x: ___ôn xao.", "x", ["s", "ch", "tr"], "Viết “xôn xao” với âm đầu x."],
        ["Từ nào viết đúng?", "dành dụm", ["giành dụm", "dành giụm", "giành giụm"], "“Dành dụm” nghĩa là tiết kiệm dần."],
        ["Điền r, d hoặc gi: ___ực rỡ.", "r", ["d", "gi", "g"], "Viết “rực rỡ”."],
        ["Từ nào có vần “uyu”?", "khúc khuỷu", ["khuya", "khuyên", "khuấy"], "“Khuỷu” có vần uyu."],
        ["Chọn tiếng đúng để hoàn chỉnh: “sạch ___”", "sẽ", ["sẻ", "xẽ", "xẻ"], "Cụm từ đúng là “sạch sẽ”."]
      ],
      "tu-loai": [
        ["Từ nào chỉ hoạt động?", "suy nghĩ", ["học sinh", "thông minh", "bài toán"], "“Suy nghĩ” là hoạt động."],
        ["Từ nào chỉ đặc điểm?", "chăm chỉ", ["cô giáo", "giảng bài", "sân trường"], "“Chăm chỉ” nêu đặc điểm."],
        ["Từ nào chỉ sự vật?", "dòng sông", ["chảy", "êm đềm", "nhanh chóng"], "“Dòng sông” gọi tên sự vật."],
        ["Nhóm nào đều chỉ hoạt động?", "đọc, viết, tính", ["bút, vở, thước", "đẹp, sạch, ngoan", "mẹ, bé, cô"], "Cả ba từ đều chỉ hoạt động."],
        ["Trong câu “Gió thổi nhè nhẹ”, từ chỉ đặc điểm là:", "nhè nhẹ", ["gió", "thổi", "gió thổi"], "“Nhè nhẹ” nêu đặc điểm của hoạt động thổi."],
        ["Trong câu “Đàn cò trắng bay trên đồng”, từ chỉ sự vật là:", "đàn cò", ["trắng", "bay", "trên"], "“Đàn cò” gọi tên sự vật."]
      ],
      "cau": [
        ["Câu “Bác nông dân đang gặt lúa.” trả lời câu hỏi nào?", "Ai làm gì?", ["Ai thế nào?", "Ai là gì?", "Ở đâu?"], "Câu nêu người và hoạt động."],
        ["Câu “Mặt hồ phẳng lặng.” thuộc mẫu nào?", "Ai thế nào?", ["Ai làm gì?", "Ai là gì?", "Khi nào?"], "Câu nêu đặc điểm của mặt hồ."],
        ["Bộ phận trả lời “Làm gì?” trong câu “Em bé ngủ ngon.” là:", "ngủ ngon", ["em bé", "bé", "ngon"], "“Ngủ ngon” nêu hoạt động, trạng thái."],
        ["Bộ phận trả lời “Ai?” trong câu “Các bạn nhỏ trồng cây.” là:", "Các bạn nhỏ", ["trồng cây", "cây", "nhỏ"], "“Các bạn nhỏ” là người thực hiện hoạt động."],
        ["Câu nào dùng để đề nghị?", "Bạn giúp mình đóng cửa nhé!", ["Cửa đã đóng.", "Ai đóng cửa?", "Cánh cửa màu xanh."], "Từ “nhé” thể hiện lời đề nghị."],
        ["Câu nào là câu giới thiệu?", "Bố em là kĩ sư.", ["Bố em đang làm việc.", "Bố em rất vui.", "Bố em ở đâu?"], "Câu dùng mẫu Ai là gì? để giới thiệu."]
      ],
      "dau-cau": [
        ["Dấu hai chấm thường dùng để làm gì?", "Báo hiệu phần giải thích hoặc liệt kê", ["Kết thúc câu hỏi", "Ngăn cách tiếng trong từ", "Thay mọi dấu chấm"], "Dấu hai chấm báo hiệu phần sau là giải thích hoặc liệt kê."],
        ["Điền dấu phù hợp: “Giỏ có ba loại quả___ cam, táo, lê.”", ":", ["?", "!", "."], "Phần sau dấu hai chấm là nội dung liệt kê."],
        ["Câu nào đặt dấu phẩy đúng?", "Buổi sáng, em tập thể dục.", ["Buổi, sáng em tập thể dục.", "Buổi sáng em, tập thể dục.", "Buổi sáng em tập, thể dục."], "Dấu phẩy ngăn bộ phận chỉ thời gian với phần chính."],
        ["Cuối câu cảm dùng dấu nào?", "Dấu chấm than", ["Dấu hỏi", "Dấu phẩy", "Dấu hai chấm"], "Câu cảm thường kết thúc bằng dấu chấm than."],
        ["Dấu ngoặc kép có thể dùng để:", "Đánh dấu lời nói trực tiếp", ["Kết thúc câu hỏi", "Tách các tiếng", "Thay dấu phẩy"], "Ngoặc kép đánh dấu lời dẫn trực tiếp hoặc từ ngữ đặc biệt."],
        ["Điền dấu: “Lan hỏi___ Bạn đã làm bài chưa?”", ":", [",", ".", "!"], "Dấu hai chấm báo hiệu lời nói phía sau."]
      ],
      "doc-hieu": [
        ["<p class=\"passage\">Sân trường rợp bóng cây. Giờ ra chơi, chúng em đọc sách dưới gốc phượng và trò chuyện vui vẻ.</p>Các bạn đọc sách ở đâu?", "Dưới gốc phượng", ["Trong lớp", "Ngoài cổng", "Ở thư viện"], "Đoạn văn nêu rõ các bạn đọc dưới gốc phượng."],
        ["<p class=\"passage\">Minh thấy bà xách túi nặng liền chạy tới đỡ. Bà mỉm cười khen Minh ngoan.</p>Vì sao bà khen Minh?", "Vì Minh giúp bà xách túi", ["Vì Minh chạy nhanh", "Vì Minh mua túi", "Vì Minh đi chơi"], "Minh chủ động giúp bà mang đồ nặng."],
        ["<p class=\"passage\">Mầm cây đội đất nhú lên. Nó đón ánh nắng, uống những giọt sương và lớn dần mỗi ngày.</p>Điều gì giúp mầm cây lớn?", "Ánh nắng và những giọt sương", ["Bóng tối", "Đá sỏi", "Gió bão"], "Đoạn văn nhắc ánh nắng và giọt sương."],
        ["<p class=\"passage\">Thư viện lớp em có nhiều sách hay. Mỗi thứ sáu, các bạn đổi sách cho nhau đọc.</p>Các bạn đổi sách vào ngày nào?", "Thứ sáu", ["Thứ hai", "Thứ ba", "Chủ nhật"], "Thông tin nằm ở câu thứ hai."],
        ["<p class=\"passage\">Chú chó nằm trước cửa. Nghe tiếng chân chủ, chú bật dậy, vẫy đuôi mừng rỡ.</p>Chú chó thể hiện niềm vui bằng cách nào?", "Bật dậy và vẫy đuôi", ["Nằm ngủ", "Chạy ra vườn", "Sủa người lạ"], "Hai hành động bật dậy, vẫy đuôi cho thấy chú vui."],
        ["<p class=\"passage\">Chiếc lá khô rời cành, chao nhẹ trong gió rồi đáp xuống thảm cỏ.</p>Chiếc lá đáp xuống đâu?", "Thảm cỏ", ["Mặt hồ", "Mái nhà", "Cành cây"], "Cuối câu cho biết chiếc lá đáp xuống thảm cỏ."]
      ]
    },
    4: {
      "danh-tu": [
        ["Từ nào là danh từ?", "niềm vui", ["vui vẻ", "vui chơi", "rất vui"], "“Niềm vui” là danh từ chỉ khái niệm."],
        ["Danh từ riêng nào viết đúng?", "sông Hồng", ["Sông hồng", "sông hồng", "Sông Hồng"], "Tên riêng “Hồng” viết hoa; từ chỉ loại “sông” không viết hoa khi đứng trước."],
        ["Nhóm nào gồm toàn danh từ?", "học sinh, trường học, kiến thức", ["học, đẹp, trường", "nhanh, chạy, cây", "sách, đọc, hay"], "Cả ba từ đều gọi tên người, sự vật hoặc khái niệm."],
        ["Danh từ trong câu “Mùa xuân mang đến sức sống mới.” là:", "mùa xuân, sức sống", ["mang đến", "mới", "đến"], "“Mùa xuân”, “sức sống” là danh từ."],
        ["Từ nào là danh từ chỉ đơn vị?", "chiếc", ["xe", "chạy", "nhanh"], "“Chiếc” là danh từ chỉ đơn vị."],
        ["Danh từ riêng trong câu “Lan sống ở Hà Nội.” là:", "Lan, Hà Nội", ["sống", "ở", "Lan sống"], "Lan và Hà Nội là tên riêng."]
      ],
      "dong-tu": [
        ["Từ nào là động từ?", "suy nghĩ", ["ý nghĩ", "thông minh", "sâu sắc"], "“Suy nghĩ” chỉ hoạt động."],
        ["Động từ trong câu “Chim én báo hiệu mùa xuân về.” là:", "báo hiệu, về", ["chim én", "mùa xuân", "chim, mùa"], "“Báo hiệu” và “về” chỉ hoạt động, trạng thái."],
        ["Nhóm nào gồm toàn động từ?", "đi, đứng, ngồi", ["cao, thấp, rộng", "bàn, ghế, tủ", "em, chị, mẹ"], "Cả ba từ đều chỉ hoạt động hoặc trạng thái."],
        ["Từ nào không phải động từ?", "dịu dàng", ["chạy", "ngủ", "nói"], "“Dịu dàng” là tính từ."],
        ["Động từ phù hợp: “Dòng sông ___ qua làng.”", "chảy", ["xanh", "dài", "mát"], "“Chảy” nêu hoạt động của dòng sông."],
        ["Trong câu “Bé đang ngủ”, từ “đang” bổ sung ý nghĩa gì?", "Hoạt động đang diễn ra", ["Hoạt động đã kết thúc", "Mệnh lệnh", "Phủ định"], "“Đang” cho biết hoạt động diễn ra ở hiện tại."]
      ],
      "tinh-tu": [
        ["Từ nào là tính từ?", "trong trẻo", ["tiếng hát", "ca hát", "người hát"], "“Trong trẻo” chỉ đặc điểm."],
        ["Tính từ trong câu “Con đường làng quanh co, sạch sẽ.” là:", "quanh co, sạch sẽ", ["con đường", "làng", "con đường làng"], "Hai từ nêu đặc điểm của con đường."],
        ["Nhóm nào gồm toàn tính từ?", "cao, rộng, đẹp", ["chạy, nhảy, bơi", "nhà, cửa, sân", "em, anh, chị"], "Cả ba từ đều chỉ đặc điểm."],
        ["Từ nào miêu tả màu sắc?", "đỏ thắm", ["chạy nhanh", "bông hoa", "tỏa hương"], "“Đỏ thắm” nêu màu sắc."],
        ["Chọn tính từ thích hợp: “Mặt hồ ___ như gương.”", "phẳng lặng", ["chạy", "dòng nước", "soi"], "“Phẳng lặng” miêu tả mặt hồ."],
        ["Từ nào không phải tính từ?", "học tập", ["chăm chỉ", "ngoan ngoãn", "thật thà"], "“Học tập” là động từ."]
      ],
      "cau": [
        ["Chủ ngữ trong câu “Những bông hoa ngoài vườn đang nở rộ.” là:", "Những bông hoa ngoài vườn", ["đang nở rộ", "nở rộ", "ngoài vườn"], "Chủ ngữ nêu sự vật được nói đến."],
        ["Vị ngữ trong câu “Cánh đồng lúa chín vàng óng.” là:", "chín vàng óng", ["cánh đồng", "cánh đồng lúa", "lúa"], "Vị ngữ nêu đặc điểm của chủ ngữ."],
        ["Câu nào là câu hỏi?", "Vì sao lá cây có màu xanh?", ["Lá cây có màu xanh.", "Lá cây xanh quá!", "Hãy quan sát lá cây."], "Câu dùng để hỏi và kết thúc bằng dấu hỏi."],
        ["Câu “Bạn nhớ mang áo mưa nhé!” dùng để:", "Đề nghị, nhắc nhở", ["Kể chuyện", "Hỏi", "Giới thiệu"], "Từ “nhé” thể hiện lời nhắc."],
        ["Trạng ngữ trong câu “Buổi sáng, chim hót ríu ran.” là:", "Buổi sáng", ["chim", "hót ríu ran", "ríu ran"], "“Buổi sáng” bổ sung thời gian."],
        ["Câu nào có đủ chủ ngữ và vị ngữ?", "Đàn chim bay về tổ.", ["Ngoài cánh đồng.", "Bay về tổ.", "Những đàn chim."], "“Đàn chim” là chủ ngữ, “bay về tổ” là vị ngữ."]
      ],
      "doc-hieu": [
        ["<p class=\"passage\">Trời vừa hửng sáng, ông em đã ra vườn. Ông nhẹ tay vun từng gốc rau, bắt sâu rồi tưới nước.</p>Ông chăm vườn vào lúc nào?", "Khi trời vừa hửng sáng", ["Giữa trưa", "Buổi tối", "Lúc mưa to"], "Thời gian được nêu ngay đầu đoạn."],
        ["<p class=\"passage\">Cây bàng đứng lặng giữa sân trường. Mùa hè, tán lá xòe rộng che mát cho chúng em vui chơi.</p>Lợi ích của cây bàng được nhắc đến là gì?", "Che mát sân chơi", ["Cho quả ngọt", "Làm hàng rào", "Báo thức"], "Tán lá bàng che mát cho học sinh."],
        ["<p class=\"passage\">An làm rơi hộp bút của bạn. Em nhận lỗi, nhặt lại từng chiếc bút và xin lỗi bạn.</p>Phẩm chất đáng quý của An là:", "Biết nhận lỗi", ["Hay khoe", "Nhút nhát", "Thiếu cẩn thận"], "An không trốn tránh mà nhận lỗi và khắc phục."],
        ["<p class=\"passage\">Dòng suối len qua những tảng đá, lúc róc rách vui tai, lúc tung bọt trắng xóa.</p>Từ nào gợi âm thanh của suối?", "róc rách", ["len qua", "trắng xóa", "tảng đá"], "“Róc rách” là từ tượng thanh."],
        ["<p class=\"passage\">Mỗi cuốn sách mở ra một thế giới mới. Sách giúp ta hiểu thêm về con người, thiên nhiên và nuôi dưỡng những ước mơ đẹp.</p>Ý chính của đoạn là gì?", "Ích lợi của việc đọc sách", ["Cách làm một cuốn sách", "Giá bán sách", "Cách xếp sách"], "Các câu đều nói về giá trị mà sách mang lại."],
        ["<p class=\"passage\">Sau cơn mưa, con đường sạch bóng. Cây cối như được gội rửa, lá xanh non lấp lánh dưới nắng.</p>Cảnh vật sau mưa thế nào?", "Sạch và tươi sáng", ["Khô cằn", "Tối tăm", "Bụi mù"], "Các từ “sạch bóng”, “xanh non”, “lấp lánh” gợi vẻ tươi sáng."]
      ]
    },
    5: {
      "tu-nghia": [
        ["Từ đồng nghĩa với “chăm chỉ” là:", "siêng năng", ["lười biếng", "nhút nhát", "ồn ào"], "“Siêng năng” và “chăm chỉ” có nghĩa gần giống nhau."],
        ["Từ trái nghĩa với “đoàn kết” là:", "chia rẽ", ["gắn bó", "hợp tác", "thân ái"], "“Chia rẽ” trái nghĩa với “đoàn kết”."],
        ["Nhóm nào gồm các từ đồng nghĩa?", "bao la, bát ngát, mênh mông", ["cao, thấp, rộng", "đi, đứng, ngồi", "vui, buồn, giận"], "Ba từ đều gợi không gian rộng lớn."],
        ["Từ “chạy” trong “đồng hồ chạy đúng giờ” có nghĩa là:", "hoạt động", ["di chuyển bằng chân", "trốn tránh", "điều khiển"], "Ở đây “chạy” mang nghĩa máy móc hoạt động."],
        ["Từ trái nghĩa với “khiêm tốn” là:", "kiêu căng", ["nhã nhặn", "thật thà", "chân thành"], "“Kiêu căng” đối lập với “khiêm tốn”."],
        ["Từ nào có nghĩa gần với “dũng cảm”?", "gan dạ", ["rụt rè", "yếu ớt", "vội vàng"], "“Gan dạ” có nghĩa gần “dũng cảm”."]
      ],
      "dai-tu": [
        ["Đại từ trong câu “Tôi rất yêu mái trường của mình.” là:", "tôi, mình", ["yêu", "mái trường", "rất"], "“Tôi”, “mình” dùng để xưng hô."],
        ["Từ nào là đại từ nghi vấn?", "ai", ["và", "nhưng", "vì"], "“Ai” dùng để hỏi về người."],
        ["Quan hệ từ trong câu “Lan và Mai cùng trực nhật.” là:", "và", ["Lan", "Mai", "cùng"], "“Và” nối hai từ Lan, Mai."],
        ["Điền quan hệ từ: “___ trời mưa nên đường trơn.”", "Vì", ["Nhưng", "Và", "Của"], "Cặp “vì… nên…” biểu thị nguyên nhân – kết quả."],
        ["Cặp quan hệ từ nào biểu thị tương phản?", "tuy… nhưng…", ["vì… nên…", "nếu… thì…", "không những… mà còn…"], "“Tuy… nhưng…” biểu thị hai ý tương phản."],
        ["Trong câu “Chiếc bút này là của em”, đại từ là:", "này, em", ["chiếc bút", "là", "của"], "“Này” dùng để trỏ, “em” dùng để xưng hô."]
      ],
      "lien-ket": [
        ["Hai câu “Lan có một chú mèo. Nó rất ngoan.” liên kết bằng cách nào?", "Dùng từ thay thế", ["Lặp từ", "Dùng từ nối", "Dùng dấu hai chấm"], "“Nó” thay cho “chú mèo”."],
        ["Từ nối phù hợp: “Trời mưa to. ___, chúng em vẫn đến trường đúng giờ.”", "Tuy nhiên", ["Vì vậy", "Đầu tiên", "Ngoài ra"], "“Tuy nhiên” nối hai ý tương phản."],
        ["Cặp câu nào liên kết bằng lặp từ?", "Hoa phượng đã nở. Hoa phượng đỏ rực sân trường.", ["Nam học giỏi. Bạn ấy rất chăm.", "Trời mưa. Vì vậy, đường trơn.", "Lan đọc còn Mai viết."], "Từ “hoa phượng” được lặp lại."],
        ["Từ “đó” trong “Em thăm Huế. Đó là một thành phố đẹp.” thay cho:", "Huế", ["em", "thăm", "đẹp"], "“Đó” thay cho địa danh Huế."],
        ["Từ nối nào biểu thị kết quả?", "vì vậy", ["nhưng", "hoặc", "mặc dù"], "“Vì vậy” giới thiệu kết quả của ý trước."],
        ["Cách nào giúp các câu trong đoạn liên kết?", "Lặp từ, thay thế từ hoặc dùng từ nối", ["Viết câu thật dài", "Chỉ dùng dấu chấm", "Bỏ chủ ngữ mọi câu"], "Ba cách phổ biến là lặp, thay thế và nối."]
      ],
      "dau-cau": [
        ["Dấu gạch ngang có thể dùng để:", "Đánh dấu lời nói trực tiếp của nhân vật", ["Kết thúc câu hỏi", "Ngăn cách các tiếng", "Viết số thập phân"], "Gạch ngang đặt đầu dòng có thể đánh dấu lời nhân vật."],
        ["Dấu ngoặc kép trong câu thường dùng để:", "Đánh dấu lời dẫn trực tiếp", ["Thay dấu chấm", "Nối hai tiếng", "Kết thúc đoạn"], "Ngoặc kép đánh dấu lời nói được dẫn nguyên văn."],
        ["Điền dấu: “Mẹ hỏi___ Con đã chuẩn bị sách chưa?”", ":", [".", ",", "!"], "Dấu hai chấm báo hiệu lời nói trực tiếp."],
        ["Dấu chấm phẩy dùng để:", "Ngăn cách các vế hoặc bộ phận liệt kê phức tạp", ["Kết thúc mọi câu", "Đặt sau câu hỏi", "Nối âm tiết"], "Dấu chấm phẩy tạo mức ngắt mạnh hơn dấu phẩy."],
        ["Câu nào dùng dấu ngoặc đơn đúng mục đích?", "Hà Nội (thủ đô Việt Nam) có nhiều hồ đẹp.", ["Hà Nội? thủ đô Việt Nam.", "Hà Nội! thủ đô Việt Nam.", "Hà Nội: thủ đô Việt Nam?"], "Ngoặc đơn chứa phần chú thích."],
        ["Dấu ba chấm có thể biểu thị:", "Lời nói ngập ngừng hoặc còn liệt kê chưa hết", ["Một câu hỏi", "Tên riêng", "Phép nhân"], "Dấu ba chấm báo hiệu lời chưa dứt hoặc liệt kê chưa hết."]
      ],
      "doc-hieu": [
        ["<p class=\"passage\">Không có con đường nào tự nhiên thành lối. Người ta đi mãi, san sẻ chướng ngại, rồi lối nhỏ mới hiện ra.</p>Đoạn văn gợi bài học nào?", "Kiên trì sẽ tạo nên con đường", ["Nên tránh mọi khó khăn", "Chỉ đi trên đường lớn", "Không cần hợp tác"], "Hình ảnh con đường được tạo nên nhờ đi mãi và vượt chướng ngại."],
        ["<p class=\"passage\">Bác bảo vệ đến trường từ rất sớm. Bác mở cổng, quét sân và luôn nhắc chúng em đi lại an toàn.</p>Tình cảm phù hợp với bác bảo vệ là:", "Biết ơn và kính trọng", ["Thờ ơ", "Sợ hãi", "Ghen tị"], "Bác làm nhiều việc âm thầm để chăm lo cho học sinh."],
        ["<p class=\"passage\">Rừng giữ nước, chắn gió và là ngôi nhà của muôn loài. Bảo vệ rừng cũng là bảo vệ cuộc sống của con người.</p>Ý chính là gì?", "Vai trò và sự cần thiết bảo vệ rừng", ["Cách khai thác gỗ", "Tên các loài thú", "Một chuyến du lịch"], "Đoạn nêu lợi ích của rừng và lời nhắn bảo vệ rừng."],
        ["<p class=\"passage\">Thất bại trong lần thi đầu không làm Vy nản. Em xem lại lỗi, luyện tập đều đặn và tiến bộ từng ngày.</p>Điều giúp Vy tiến bộ là:", "Biết sửa lỗi và kiên trì luyện tập", ["May mắn", "Bỏ cuộc", "Được cho điểm"], "Vy phân tích lỗi và luyện đều."],
        ["<p class=\"passage\">Tiếng đàn vang lên trong trẻo. Căn phòng đang ồn bỗng lặng đi, mọi người chăm chú lắng nghe.</p>Chi tiết nào cho thấy tiếng đàn cuốn hút?", "Mọi người lặng đi và chăm chú nghe", ["Căn phòng rộng", "Cây đàn mới", "Ngoài trời nắng"], "Phản ứng của mọi người thể hiện sức hấp dẫn."],
        ["<p class=\"passage\">Một lời cảm ơn đúng lúc có thể làm người khác ấm lòng. Đó cũng là cách ta trân trọng sự giúp đỡ đã nhận.</p>Thông điệp của đoạn là:", "Hãy biết nói lời cảm ơn", ["Không nên nhận giúp đỡ", "Chỉ cảm ơn người quen", "Lời nói không quan trọng"], "Đoạn khẳng định ý nghĩa của lời cảm ơn."]
      ]
    }
  };

  function vietnameseQuestion(grade, topic) {
    const gradeBank = vnBank[grade];
    const effective = topic === "all" ? pick(Object.keys(gradeBank)) : topic;
    const item = pick(gradeBank[effective]);
    return choiceQ(item[0], item[1], item[2], item[3]);
  }

  function generate(subject, grade, topic, level, count) {
    const items = [];
    const seen = new Set();
    let safety = 0;
    while (items.length < count && safety < count * 25) {
      const q = subject === "math" ? mathQuestion(grade, topic, level) : vietnameseQuestion(grade, topic);
      const key = q.prompt + "|" + q.answer;
      if (!seen.has(key) || safety > count * 12) {
        seen.add(key);
        items.push(q);
      }
      safety++;
    }
    return items;
  }

  window.HOCNHE = { catalog, generate };
})();
