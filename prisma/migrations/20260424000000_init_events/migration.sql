-- CreateTable
CREATE TABLE "events" (
    "id" BIGSERIAL NOT NULL,
    "visitor_id" VARCHAR(64) NOT NULL,
    "session_id" VARCHAR(64),
    "event_name" VARCHAR(64) NOT NULL,
    "properties" JSONB,
    "is_dev" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_created_at_desc_idx" ON "events"("created_at" DESC);

-- CreateIndex
CREATE INDEX "events_visitor_created_at_desc_idx" ON "events"("visitor_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "events_name_created_at_desc_idx" ON "events"("event_name", "created_at" DESC);
