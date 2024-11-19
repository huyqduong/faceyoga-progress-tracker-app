-- Add new columns to exercises table
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS instructions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}';

-- Update sample exercises with more details
UPDATE exercises
SET 
    instructions = ARRAY[
        'Open your mouth wide and stick out your tongue',
        'Stretch your tongue down towards your chin',
        'Make a loud "ahh" sound from your throat',
        'Hold for 10 seconds',
        'Repeat 3 times'
    ],
    benefits = ARRAY[
        'Reduces face and neck tension',
        'Improves blood circulation',
        'Tones facial muscles',
        'Helps with jaw tension'
    ]
WHERE title = 'Lion Face Exercise';

UPDATE exercises
SET 
    instructions = ARRAY[
        'Place your index fingers on your cheekbones',
        'Smile while keeping your lips together',
        'Lift your cheeks up towards your eyes',
        'Hold for 5 seconds',
        'Release and repeat 10 times'
    ],
    benefits = ARRAY[
        'Lifts and tones cheek muscles',
        'Reduces nasolabial folds',
        'Improves facial contours',
        'Creates a natural face lift effect'
    ]
WHERE title = 'Cheek Lifter';