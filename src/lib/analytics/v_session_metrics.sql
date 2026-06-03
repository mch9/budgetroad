-- v_session_metrics — 세션 1행 집계 뷰 (분석 대시보드 데이터 소스)
-- 적용: Supabase (project tmtplfxydnhahjlqfjnp) 에 이미 적용됨.
-- 재적용/재현: 이 SQL을 그대로 실행 (CREATE OR REPLACE 라 멱등).
--   - psql/Supabase SQL editor 에 붙여넣기, 또는
--   - prisma db execute --file src/lib/analytics/v_session_metrics.sql
-- events 테이블(is_dev=false 운영 데이터)을 session_id 단위로 접어 day(KST)와
-- 모든 지표 플래그를 한 행에 담는다. 대시보드의 모든 날짜필터 쿼리가 이 뷰를 읽는다.

CREATE OR REPLACE VIEW v_session_metrics AS
SELECT
  session_id,
  MAX(visitor_id) AS visitor_id,
  (MIN(created_at) AT TIME ZONE 'Asia/Seoul')::date AS day,
  MAX(properties->>'persona') AS persona,
  -- funnel
  MAX((event_name = 'service_entered')::int)                                   AS svc_entered,
  MAX((event_name = 'budget_draft_entered')::int)                              AS draft_entered,
  MAX((event_name IN ('service_entered','budget_draft_entered'))::int)         AS entered_any,
  MAX((event_name = 'input_started')::int)                                     AS input_started,
  MAX((event_name = 'result_viewed')::int)                                     AS result_viewed,
  -- intent / edit
  MAX((event_name = 'care_option_toggled')::int)                               AS toggled,
  COUNT(*) FILTER (WHERE event_name = 'care_option_toggled')                   AS toggle_count,
  MAX((event_name = 'result_reset_clicked')::int)                              AS reset_clicked,
  -- save / share
  MAX((event_name = 'share_action_clicked'
       AND properties->>'method' IN ('pdf','image','link'))::int)             AS saved_shared,
  MAX((event_name = 'share_action_clicked' AND properties->>'method' = 'pdf')::int)    AS share_pdf,
  MAX((event_name = 'share_action_clicked' AND properties->>'method' = 'image')::int)  AS share_image,
  MAX((event_name = 'share_action_clicked' AND properties->>'method' = 'link')::int)   AS share_link,
  MAX((event_name = 'share_action_clicked' AND properties->>'method' = 'expert')::int) AS share_expert,
  -- tab open (result_tab_viewed)
  MAX((event_name = 'result_tab_viewed' AND properties->>'tab' = 'care')::int)          AS tab_care,
  MAX((event_name = 'result_tab_viewed' AND properties->>'tab' = 'itemized')::int)      AS tab_itemized,
  MAX((event_name = 'result_tab_viewed' AND properties->>'tab' = 'comprehensive')::int) AS tab_comprehensive,
  -- scroll explore (result_scroll_depth)
  MAX((event_name = 'result_scroll_depth' AND properties->>'tab' = 'care')::int)          AS scroll_care,
  MAX((event_name = 'result_scroll_depth' AND properties->>'tab' = 'itemized')::int)      AS scroll_itemized,
  MAX((event_name = 'result_scroll_depth' AND properties->>'tab' = 'comprehensive')::int) AS scroll_comprehensive,
  -- entered via shared link
  MAX((event_name = 'shared_result_viewed')::int)                              AS via_share_link,
  -- dwell on result (sec)
  MAX((properties->>'time_on_result_sec')::numeric)
      FILTER (WHERE event_name = 'result_exited' AND properties ? 'time_on_result_sec') AS dwell_sec,
  COUNT(*) AS session_events
FROM events
WHERE is_dev = false AND session_id IS NOT NULL
GROUP BY session_id;
