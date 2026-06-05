// 결과·예산·체크리스트는 localStorage(이 브라우저)에만 저장됨 →
// 방문 기록/쿠키 삭제 시 초기화된다는 안내. 결과 페이지·/manage 하단 공통 사용.
export function DataResetNotice() {
  return (
    <p className="px-6 pb-6 pt-3 text-center text-xs leading-5 text-[#99A1AF]">
      입력 내역은 이 브라우저에만 저장돼요. 방문 기록·쿠키를 삭제하면 결과가 초기화됩니다.
    </p>
  );
}
