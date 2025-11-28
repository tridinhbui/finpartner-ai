-- FinPartner AI Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== CHAT THREADS TABLE ====================
CREATE TABLE IF NOT EXISTS chat_threads (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    workspace_state JSONB DEFAULT '{}'::jsonb,
    highlighted_numbers JSONB DEFAULT '[]'::jsonb,
    
    -- Indexes for better performance
    CONSTRAINT chat_threads_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_chat_threads_user_id ON chat_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_updated_at ON chat_threads(updated_at DESC);

-- ==================== MESSAGES TABLE ====================
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'model', 'system')),
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    related_chart JSONB,
    related_table JSONB,
    is_error BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT messages_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);

-- ==================== DOCUMENTS TABLE ====================
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    thread_id TEXT NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    storage_path TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT documents_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_documents_thread_id ON documents(thread_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents(uploaded_at DESC);

-- ==================== ROW LEVEL SECURITY (RLS) ====================

-- Enable RLS
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policies for chat_threads
CREATE POLICY "Users can view their own threads"
    ON chat_threads FOR SELECT
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert their own threads"
    ON chat_threads FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update their own threads"
    ON chat_threads FOR UPDATE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can delete their own threads"
    ON chat_threads FOR DELETE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'email');

-- Policies for messages
CREATE POLICY "Users can view messages from their threads"
    ON messages FOR SELECT
    USING (
        thread_id IN (
            SELECT id FROM chat_threads 
            WHERE user_id = current_setting('request.jwt.claims', true)::json->>'email'
        )
    );

CREATE POLICY "Users can insert messages to their threads"
    ON messages FOR INSERT
    WITH CHECK (
        thread_id IN (
            SELECT id FROM chat_threads 
            WHERE user_id = current_setting('request.jwt.claims', true)::json->>'email'
        )
    );

CREATE POLICY "Users can delete messages from their threads"
    ON messages FOR DELETE
    USING (
        thread_id IN (
            SELECT id FROM chat_threads 
            WHERE user_id = current_setting('request.jwt.claims', true)::json->>'email'
        )
    );

-- Policies for documents
CREATE POLICY "Users can view their documents"
    ON documents FOR SELECT
    USING (
        thread_id IN (
            SELECT id FROM chat_threads 
            WHERE user_id = current_setting('request.jwt.claims', true)::json->>'email'
        )
    );

CREATE POLICY "Users can insert documents to their threads"
    ON documents FOR INSERT
    WITH CHECK (
        thread_id IN (
            SELECT id FROM chat_threads 
            WHERE user_id = current_setting('request.jwt.claims', true)::json->>'email'
        )
    );

CREATE POLICY "Users can delete their documents"
    ON documents FOR DELETE
    USING (
        thread_id IN (
            SELECT id FROM chat_threads 
            WHERE user_id = current_setting('request.jwt.claims', true)::json->>'email'
        )
    );

-- ==================== STORAGE BUCKET ====================
-- Run this in Supabase Dashboard > Storage

-- Create bucket for documents
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('documents', 'documents', true);

-- Storage policies (add in Supabase Dashboard)
-- Allow authenticated users to upload files
-- Allow public read access to files

-- ==================== FUNCTIONS & TRIGGERS ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for chat_threads
DROP TRIGGER IF EXISTS update_chat_threads_updated_at ON chat_threads;
CREATE TRIGGER update_chat_threads_updated_at
    BEFORE UPDATE ON chat_threads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================== SAMPLE DATA (OPTIONAL) ====================

-- Insert sample thread for testing
-- INSERT INTO chat_threads (id, user_id, title, workspace_state)
-- VALUES (
--     'sample-thread-1',
--     'test@example.com',
--     'Sample Financial Analysis',
--     '{"activeTab": "chart", "chartData": null, "tableData": null}'::jsonb
-- );

-- ==================== USEFUL QUERIES ====================

-- Count threads per user
-- SELECT user_id, COUNT(*) as thread_count
-- FROM chat_threads
-- GROUP BY user_id;

-- Count messages per thread
-- SELECT t.title, COUNT(m.id) as message_count
-- FROM chat_threads t
-- LEFT JOIN messages m ON t.id = m.thread_id
-- GROUP BY t.id, t.title;

-- Storage usage
-- SELECT 
--     COUNT(*) as file_count,
--     SUM(file_size) / 1024 / 1024 as total_mb
-- FROM documents;

-- ==================== CLEANUP QUERIES ====================

-- Delete old threads (older than 90 days)
-- DELETE FROM chat_threads
-- WHERE updated_at < NOW() - INTERVAL '90 days';

-- Delete orphaned messages (if any)
-- DELETE FROM messages
-- WHERE thread_id NOT IN (SELECT id FROM chat_threads);

COMMENT ON TABLE chat_threads IS 'Stores chat conversation threads with workspace state';
COMMENT ON TABLE messages IS 'Individual messages within chat threads';
COMMENT ON TABLE documents IS 'Metadata for uploaded PDF/Excel files';

