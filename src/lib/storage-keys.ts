export const STORAGE_KEYS = {
  // 세션 / 결과
  MANAGE_SESSION: 'budgetroad_manage_session',
  ONBOARDING_V6: 'budgetroad_onboarding_v6',
  LEGACY_RESULT: 'budgetroad_result', // 구버전 키 — removeItem 전용 잔재
  SESSION: 'budgetroad_session',
  VISITOR: 'budgetroad_visitor_id',

  // 예산 관리
  BUDGET_ACTUAL: 'budgetroad_budget_actual',
  CUSTOM_ITEMS: 'budgetroad_custom_items',
  DELETED_ITEMS: 'budgetroad_deleted_items',

  // 체크리스트
  CHECKLIST: 'budgetroad_checklist',
  CHECKLIST_USER: 'budgetroad_checklist_user',
  CHECKLIST_HIDDEN: 'budgetroad_checklist_hidden',
  CHECKLIST_USER_HIDDEN: 'budgetroad_checklist_user_hidden',
  checklistOrder: (groupId: string) => `budgetroad_checklist_order_${groupId}`,

  // UI 상태
  SATISFACTION_DONE: 'budgetroad_satisfaction_done',
};
