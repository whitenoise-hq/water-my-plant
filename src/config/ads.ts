// 개발 중(npm run dev)에는 테스트 광고 ID를, 출시 빌드(npm run build)에는 실제 광고 ID를 써요.
// 실제 광고 ID는 앱인토스 콘솔의 광고 그룹 상세 화면에서 확인할 수 있어요.
// 보상형은 지금 콘솔에서 만들 수 없어서(2026-10-20 기준) 비워 두고, 어제 기록하기는 광고 없이 열어요.
const LIVE_AD_GROUP_IDS = {
  rewarded: "",
  banner: "ait.v2.live.e4c251ce84d64039",
} as const;

const TEST_AD_GROUP_IDS = {
  rewarded: "",
  banner: "ait-ad-test-banner-id",
} as const;

export const AD_GROUP_IDS = import.meta.env.PROD ? LIVE_AD_GROUP_IDS : TEST_AD_GROUP_IDS;

// 보상형 광고 그룹이 생기면 ID를 넣는 것만으로 '광고 보고 어제 기록하기'가 켜져요.
export const IS_REWARDED_READY = AD_GROUP_IDS.rewarded !== "";
