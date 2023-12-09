//#region Lấy các phần tử ở trong DOM
const scroses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let scoreActive = 10;
const btnScoreGroup = document.querySelector(".btn-score-group");
const listFeedbackContent = document.querySelector(".list-feedback-content");
let listFeedbackLocal = JSON.parse(localStorage.getItem("feedbacks")) || [];
const feedbackInput = document.querySelector("#feedbackInput");
const error = document.querySelector(".error");
const btnSend = document.querySelector(".btn-send");
const reviewNumber = document.querySelector(".review-number");
const averageRate = document.querySelector(".average-number");
const inputContainer = document.querySelector(".input-container");

//#endregion

//#region Các biến toàn cục
let feedback = "";
//#endregion

// Khi click vào nơi bất kì trong phạm vi input thì thực hiện focus vào input nhập
inputContainer.addEventListener("click", () => {
  inputContainer.focus();
});

// Khi ứng dụng được chạy thì focus vào input nhập liệu
feedbackInput.focus();

/**
 * Hiển thị danh sách các nút điểm
 */
const renderListButtonScore = () => {
  const scoreHtmls = scroses.map((score) => {
    return `
      <button class="btn-score ${
        score === scoreActive ? "active" : ""
      }" data-score="${score}">${score}</button>
    `;
  });

  const scroreHtml = scoreHtmls.join("");

  btnScoreGroup.innerHTML = scroreHtml;
};

// Xử lý khi click vào từng điểm sẽ active vào button và lấy ra số điểm
const handleScoreButtonClick = () => {
  btnScoreGroup.addEventListener("click", (e) => {
    const targetButton = e.target.closest(".btn-score");
    console.log(targetButton);
    if (targetButton) {
      const allButtons = btnScoreGroup.querySelectorAll(".btn-score");
      allButtons.forEach((button) => button.classList.remove("active"));
      targetButton.classList.add("active");
      scoreActive = +targetButton.dataset.score; // Cập nhật scoreActive từ data-score
    }
  });
};

/**
 * Hiển thị danh sách feedback lấy từ localStorage
 */
const renderListFeedback = () => {
  const feedbackHtmls = listFeedbackLocal.map((feedback) => {
    return `
      <div class="feedback-content">
        <div class="feedback-content-header">
          <i id="update_${feedback.feedbackId}" class="fa-solid fa-pen-to-square"></i>
          <i id="delete_${feedback.feedbackId}" class="fa-solid fa-xmark"></i>
        </div>
        <div class="feedback-content-body">
          <p class="content-feedback">${feedback.content}</p>
        </div>
        <button class="btn-score active">${feedback.score}</button>
      </div>
    `;
  });

  const feedbackHtml = feedbackHtmls.join("");

  listFeedbackContent.innerHTML = feedbackHtml;

  // Hiển thị số lượng review ra ngoài giao diện
  reviewNumber.innerHTML = listFeedbackLocal.length;
};

renderListFeedback();

const btnDelete = document.querySelectorAll(".fa-xmark");

/**
 * Xóa feedback theo id khỏi local
 */
listFeedbackContent.addEventListener("click", (e) => {
  // Kiểm tra xem trong danh sách feeadback có sự kiện từ người không và
  // kiểm tra xem sự kiện đó có được ấn vào class fa-xmak không
  if (e.target && e.target.matches(".fa-xmark")) {
    // Lấy ra id của icon close và cắt lấy id của icon đó
    const idDelete = e.target.id.split("_")[1];

    // Lọc ra những feeadback có id khác với id cần xóa
    // Nó sẽ trả về một mảng mới có các feedback khác với feedback cần xóa
    const filterFeedback = listFeedbackLocal.filter(
      (fb) => fb.feedbackId !== idDelete
    );

    // gán lại dữ liệu
    listFeedbackLocal = filterFeedback;

    // Lưu lại dữ liệu lên local
    localStorage.setItem("feedbacks", JSON.stringify(filterFeedback));

    // render lại giao diện
    renderListFeedback();

    // Tính tổng số điểm
    handleAverageRating();
  }
});

// Cập nhật feedback
let updatingFeedback = null;

listFeedbackContent.addEventListener("click", (e) => {
  if (e.target && e.target.matches(".fa-pen-to-square")) {
    const idUpdate = e.target.id.split("_")[1];
    updatingFeedback = listFeedbackLocal.find(
      (fb) => fb.feedbackId === idUpdate
    );

    if (updatingFeedback) {
      // Gán thông tin công việc vào input và active điểm
      feedbackInput.value = updatingFeedback.content;
      scoreActive = updatingFeedback.score;

      // Render lại danh sách điểm để active điểm
      renderListButtonScore();
    }
  }
});

btnSend.addEventListener("click", (e) => {
  // Ngăn chặn sự kiện khi click vào button thì bị lan truyền ra bên ngoài làm focus vào input
  e.stopPropagation();
  if (updatingFeedback) {
    // Cập nhật lại thông tin và điểm
    updatingFeedback.content = feedback;
    updatingFeedback.score = scoreActive;

    // Lưu dữ liệu mới nhất lên local
    localStorage.setItem("feedbacks", JSON.stringify(listFeedbackLocal));

    // Clean giá trị trong ô input và reset updatingFeedback
    feedbackInput.value = "";
    updatingFeedback = null;

    // Focus vào input
    feedbackInput.focus();

    // Load lại dữ liệu và tính điểm trung bình
    renderListFeedback();
    handleAverageRating();
  } else {
    // Thêm mới phản hồi nếu không phải là chức năng cập nhật
    const newFeedback = {
      feedbackId: uuidv4(),
      score: scoreActive,
      content: feedback,
    };

    listFeedbackLocal.unshift(newFeedback);
    localStorage.setItem("feedbacks", JSON.stringify(listFeedbackLocal));

    // Load lại dữ liệu và tính điểm trung bình
    renderListFeedback();
    handleAverageRating();

    // Clean giá trị trong ô input
    feedbackInput.value = "";
  }

  // Hiển thị số lượng review ra ngoài giao diện
  reviewNumber.innerHTML = listFeedbackLocal.length;

  // Validate dữ liệu
  btnSend.classList.remove("btn-dark");
});

// Validate dữ liệu đầu vào
const validateData = () => {
  feedbackInput.addEventListener("input", (e) => {
    // Nếu input không có giá trị
    if (!e.target.value.trim()) {
      // Hiển thị lỗi
      error.style.display = "block";
      // Thêm màu cho button
      btnSend.classList.remove("btn-dark");
    } else {
      feedback = e.target.value; // Thực hiện gán lại giá trị lấy từ input
      error.style.display = "none";
      btnSend.classList.add("btn-dark");
    }
  });
};

// Tính điểm trung bình đánh giá
function handleAverageRating() {
  if (listFeedbackLocal.length > 0) {
    // Lấy ra tổng số điểm của tất cả các feedback
    const totalScoreFeedback = listFeedbackLocal.reduce((a, b) => {
      return a + b.score;
    }, 0);

    // Tính điểm trung bình : DTB = tổng điểm / số lượng feedback
    const averageRating = totalScoreFeedback / listFeedbackLocal.length;
    averageRate.innerHTML = averageRating.toFixed(1);
  } else {
    averageRate.innerHTML = 0;
  }
}

handleAverageRating();
renderListButtonScore();
validateData();
// Gọi hàm xử lý khi người dùng click vào nút điểm số
handleScoreButtonClick();
