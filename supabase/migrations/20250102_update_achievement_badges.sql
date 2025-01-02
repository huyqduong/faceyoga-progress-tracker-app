-- Update achievement badges with proper SVG icons
update achievements 
set badge_image_url = case 
    when title = 'Beginner Yogi' then '/assets/badges/beginner-badge.svg'
    when title = 'Dedicated Practitioner' then '/assets/badges/intermediate-badge.svg'
    when title = 'Advanced Yogi' then '/assets/badges/advanced-badge.svg'
    when title = 'Consistency Master' then '/assets/badges/streak-badge.svg'
end;
