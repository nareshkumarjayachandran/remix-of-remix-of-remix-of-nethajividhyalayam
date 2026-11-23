# School Photo Gallery

Place your school photos in this directory, organized by category folders:

## Folder Structure

```
public/photos/
├── academics/          - Classroom learning, labs, study sessions
├── about/              - School story and campus
├── blog/               - Blog article pictures
├── sports/             - Sports events, physical activities
├── facilities/         - School buildings, labs, library, playground
├── events/             - General school events
├── activities/         - Co-curricular activities
├── annual-sports-day/  - Annual Sports Day 2024
├── teachers-day/       - Teachers' Day Celebration
├── yoga-wellness/      - Yoga & Wellness Day
├── career-guidance/    - Career Guidance Workshop
├── science-exhibition/ - Science Exhibition
├── cultural-festival/  - Cultural Festival
├── parent-teacher/     - Parent-Teacher Meeting
├── school-picnic/      - School Annual Picnic
├── art-craft/          - Art & Craft Exhibition
├── leadership/         - Principal, Chairman, Vice Principal photos
├── memories/           - General memories & moments
```

## Supported Formats
- JPG, JPEG, PNG, WebP, SVG

## How to Add Photos
1. Place image files in the appropriate category folder
2. Update `src/data/galleryData.ts` with the new image entries
3. Images will automatically appear in the gallery

## Photo backup and link inventory

`backup-manifest.json` records every current image in `public/` and `src/assets/`, its unchanged filename, original project path, SHA-256 checksum, and the files that reference it. Photos in this folder remain linked at their existing `/photos/` addresses; logos and video thumbnails retain their existing locations to avoid breaking website, email, and document links.

The downloadable photo backup preserves these paths and filenames exactly, including capitalization and file extensions. It includes logos, video thumbnails, and older uploaded images as well as the school and blog photos. Names refer to the files currently saved in this website; earlier camera/upload filenames cannot be reconstructed when they were previously renamed.

This is a point-in-time backup, not an automatic scheduled backup. Refresh the inventory and backup after adding, replacing, or removing photos.
