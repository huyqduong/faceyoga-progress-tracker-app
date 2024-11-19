-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    duration TEXT NOT NULL,
    target_area TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Exercises are publicly readable"
ON exercises FOR SELECT
USING (true);

-- Insert sample exercises
INSERT INTO exercises (title, duration, target_area, description, image_url, category, difficulty)
VALUES
    ('Lion Face Exercise', '2 minutes', 'Face & Neck', 'Opens up facial muscles and releases tension while working the platysma muscle.', 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80', 'face', 'Beginner'),
    ('Cheek Lifter', '3 minutes', 'Cheeks', 'Helps lift and tone the cheek muscles for a more defined facial structure.', 'https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?auto=format&fit=crop&w=800&q=80', 'cheeks', 'Intermediate'),
    ('Eye Firming', '4 minutes', 'Eye Area', 'Targets the muscles around the eyes to reduce the appearance of fine lines.', 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80', 'eyes', 'Advanced'),
    ('Forehead Smoother', '3 minutes', 'Forehead', 'Relaxes and smooths forehead muscles to reduce wrinkles and tension.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80', 'forehead', 'Beginner'),
    ('Neck Toner', '5 minutes', 'Neck & Jawline', 'Strengthens and tones the neck muscles for a more defined jawline.', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80', 'neck', 'Intermediate')
ON CONFLICT DO NOTHING;