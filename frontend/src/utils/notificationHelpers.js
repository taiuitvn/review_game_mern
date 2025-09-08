// Helper functions for testing notifications with proper text display

export const testNotificationMessages = {
  shortMessage: {
    title: "Thành công",
    message: "Đã lưu thành công!",
    type: "success"
  },
  
  mediumMessage: {
    title: "Cảnh báo về dung lượng",
    message: "File bạn tải lên có dung lượng lớn, việc xử lý có thể mất thời gian.",
    type: "warning"
  },
  
  longMessage: {
    title: "Thông báo quan trọng về bảo mật",
    message: "Chúng tôi phát hiện một số hoạt động bất thường trên tài khoản của bạn. Vui lòng kiểm tra lại thông tin đăng nhập và thay đổi mật khẩu nếu cần thiết để đảm bảo an toàn cho tài khoản.",
    type: "error"
  },
  
  veryLongMessage: {
    title: "Hướng dẫn sử dụng tính năng mới",
    message: "Chào mừng bạn đến với tính năng đánh giá game mới! Bạn có thể tạo review chi tiết, thêm hình ảnh, video, đánh giá từng khía cạnh của game như gameplay, đồ họa, âm thanh, và nhiều yếu tố khác. Hệ thống cũng hỗ trợ phân loại theo thể loại game và platform để người dùng khác dễ dàng tìm kiếm.",
    type: "info"
  }
};

// Function to test all notification types
export const showTestNotifications = (addNotification) => {
  const messages = Object.values(testNotificationMessages);
  
  messages.forEach((message, index) => {
    setTimeout(() => {
      addNotification(message);
    }, index * 1000); // Stagger notifications by 1 second
  });
};