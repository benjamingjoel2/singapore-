# Image sourcing notes

All 44 slots are filled. Every image comes from Wikimedia Commons. No slot was skipped.

## Source and processing
- Unsplash could not be used. `unsplash.com/napi` returns an Anubis "checking your browser" challenge (HTTP 401) to scripted clients, so all images come from Commons.
- Commons serves thumbnails only at standard widths, and a request for `2400px-` returns HTTP 400. Each image was downloaded at 3840px and scaled down to 2400px wide with ImageMagick.

## Compromises
- **rain-1:** this is a crop of a phone panorama ("Sumatra squall 2022-07-29", Kallang Basin), taken from the 3840px rendition. It is 2350x1096. The full-resolution original kept returning HTTP 429. If a taller crop is needed, re-crop from the original, which is 10759x3072.
- **hero-home:** no Commons photo matched "shophouses after rain". The pick is the most atmospheric evening street: Kampong Glam at blue hour with fairy lights. Other candidates were rejected:
  - "Chinatown at Sunset" (Edwin Soo) has heavy HDR haloing.
  - The Chinatown Food Street night shots are busy and lean on restaurant signage.
- **journal-1:** no Peranakan tile close-up with a clear licence and a Singapore location was found. The pick is a close façade of a Koon Seng Road terrace house. It looks a lot like katong-1, but it is a different house.
- **marina-2:** this is a wide panorama of the CBD skyline across Marina Bay (2400x964). Marina Bay Sands is not in the frame.
- **chinatown-3:** this shows rooftop deity sculptures at Sri Mariamman Temple, not the whole gopuram.

## Candidates rejected for location doubt
- "Singapore Neil Road 1.jpg" shows a Temple Street sign and Buddha Tooth Relic Temple, so it is not Neil Road.
- The "Katebranch – Joo Chiat road" set is titled Joo Chiat Road but shows the Koon Seng Road terrace. It was not used for katong-2.
- "Singapore style Hainanese Chicken Rice from Sing La" was taken at a restaurant in an unknown location.
- The satay photos with "Rayong" in the categories were taken in Thailand.
- The laksa photo with "Brighton" in the categories was taken in the UK.
- "Sungei Buloh Wetland Reserve 09-08-2025(12)" is a boardwalk shot whose thumbnail rendered portrait, so it fails the landscape rule.
- Hawker Chan stall: a named stall is the subject.
