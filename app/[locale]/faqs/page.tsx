import { setRequestLocale } from "next-intl/server";
import FaqAccordion from "@/components/FaqAccordion";

const items = [
  {
    question: "Có được mang đồ ăn chín lên máy bay không?",
    answer:
      "Được, hành khách có thể mang đồ ăn chín lên máy bay nếu được đóng gói cẩn thận và không có mùi quá nặng. Lưu ý các loại chất lỏng, sốt hoặc canh phải tuân thủ quy định an ninh hàng không (dung tích không quá 100ml và đựng trong túi nhựa trong suốt). Để đảm bảo sự thoải mái cho tất cả hành khách, khuyến khích mang theo các loại thức ăn gọn nhẹ, dễ bảo quản và sử dụng trên chuyến bay.",
  },
  {
    question: "Có được mang sữa của trẻ em lên máy bay không?",
    answer:
      "Được, hành khách đi cùng trẻ sơ sinh có thể mang theo sữa, sữa bột và thức ăn cho bé lên máy bay. Các loại này không bị giới hạn theo quy định chất lỏng thông thường, nhưng có thể sẽ phải xuất trình riêng khi qua kiểm tra an ninh. Để thuận tiện, bạn nên đóng gói cẩn thận và chuẩn bị sao cho dễ sử dụng trong suốt chuyến bay.",
  },
  {
    question: "Hành lý xách tay được phép mang tối đa bao nhiêu kg?",
    answer:
      "Mỗi hành khách được mang tối đa 07kg hành lý xách tay với kích thước không vượt quá 56cm x 36cm x 23cm. Ngoài ra, hành khách có thể mang thêm một túi nhỏ cá nhân (ví, máy tính xách tay...) đặt dưới ghế phía trước.",
  },
  {
    question: "Có thể mang vật nuôi lên máy bay không?",
    answer:
      "Hiện tại Sun PhuQuoc Airways chưa hỗ trợ vận chuyển vật nuôi trong khoang khách. Quý khách vui lòng liên hệ tổng đài để được tư vấn về các phương án vận chuyển hàng hóa đặc biệt phù hợp.",
  },
];

export default function Support({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 md:py-12">
      <FaqAccordion items={items} />
    </div>
  );
}
