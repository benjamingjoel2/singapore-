# Facts to verify before launch

Every factual claim on the site that can change, or that was written from general knowledge, is listed here. Check each against the official source named, update the English content in `content/en/` (and the same key in `fr/`, `de/`, `es/`), then rebuild. Tick items off as you go.

Business address used in the config, footer, legal pages and JSON-LD:
- [ ] **Arcc Spaces, 1 Marina Boulevard, Level 20, Singapore 018989**: chosen as the flagship of a premium, hospitality-led coworking operator in Singapore's CBD (Arcc Spaces' flagship, One Marina Boulevard). Confirm that Five Foot Way holds a membership or a registered-address service there before publishing, and that the unit/level format is correct. (The Great Room, often cited as Singapore's premium coworking brand, has been absorbed into Industrious; THE COLLECTIVE by JustCo at Labrador Tower and No18 at Capitol Singapore are alternatives if Arcc Spaces is not used.)

## Entry, transit and customs (stopover planner, booking terms)
Source: Immigration & Checkpoints Authority (ica.gov.sg), Singapore Customs (customs.gov.sg), Health Sciences Authority (hsa.gov.sg), Changi Airport (changiairport.com).
- [ ] **SG Arrival Card**: required for all travellers entering Singapore except citizens, PRs and certain pass holders; submitted online within 3 days before arrival; free on the official ICA site/app (MyICA Mobile). Check current exemptions, including whether transit passengers who do not clear immigration are exempt.
- [ ] **Visa-free entry by nationality**: "many nationalities can enter without a visa for a short visit". Check ICA's list of visa-required countries; the site deliberately avoids naming nationalities or day counts.
- [ ] **Transit without a visa**: travellers who stay in the transit area with a confirmed onward flight generally need no visa. Check ICA guidance, the Visa Free Transit Facility (VFTF) conditions, and the rules for travellers whose bags are not checked through or who change terminals/airlines.
- [ ] **Chewing gum**: import prohibited except small quantities of dental/medicinal gum for personal use.
- [ ] **E-cigarettes / vapes**: illegal to import, possess, use or buy; stricter enforcement since 2025 (higher fines; foreigners may be deported/barred). Confirm current penalties wording and the position for passengers in transit.
- [ ] **Medicines**: certain medicines (e.g. some sleeping pills, strong painkillers, ADHD medications) require HSA approval before import; prescription and original packaging advised; quantity limits (commonly up to 3 months' supply). Check the HSA list of controlled medicines.
- [ ] **Public drinking hours**: drinking in public places prohibited 10:30pm–7am; retail sale of takeaway alcohol prohibited in the same hours (Liquor Control (Supply and Consumption) Act 2015). **Liquor Control Zones**: Geylang and Little India, with extended restrictions on weekends, eves of public holidays and public holidays.
- [ ] **Smoking** only in designated (yellow-box) areas; check current scope of no-smoking zones (including Orchard Road).
- [ ] **Contactless bank cards on MRT/buses** (SimplyGo): confirm foreign cards accepted and any fees.

## Changi timings (stopover planner logic in `public/js/planner-core.js`)
- [ ] Gate to kerb ~1 hour (deplaning + immigration + no checked bags). Automated lanes for eligible passports.
- [ ] Changi to city 30–45 minutes by MRT or taxi; MRT change at Tanah Merah or Expo depending on the line (Thomson-East Coast Line extension to Changi may change this; check current routes).
- [ ] Be back at Changi 2.5 hours before departure (our buffer; airlines may require more).
- [ ] Planner thresholds: < ~9.5 h → stay airside; 9.5–11 h → Jewel only; ≥ 11 h → city plan; ≥ 48 h → stay.
- [ ] Katong ~20 minutes from Changi by taxi; Changi Village ~10 minutes.
- [ ] **Airside facilities**: Butterfly Garden (T3), other gardens, rest zones, transit hotels, rooftop pool, shower facilities. These change with terminal renovations; confirm what is open, and whether the free Singapore Tour for transit passengers is operating.
- [ ] Left-luggage counters in terminals.
- [ ] Terminal 5 not mentioned with a date; fine.

## Jewel Changi Airport
- [ ] Opened 2019; landside, linked to Terminal 1; reachable from T2/T3 via link bridges.
- [ ] **Opening hours**: public areas open 24 hours; retail/F&B roughly 10am–10pm; Canopy Park ticketed with its own hours.
- [ ] **HSBC Rain Vortex**: ~40 m indoor waterfall; nightly light and sound show (times change).

## Monsoon seasons and weather (shade walks, journal, home)
Source: Meteorological Service Singapore (weather.gov.sg).
- [ ] Northeast Monsoon: December to early March (wet phase Dec–Jan, dry phase from ~late Jan/Feb).
- [ ] Inter-monsoon: March/April to May, and October to November; afternoon/evening thunderstorms.
- [ ] Southwest Monsoon: June to September; Sumatra squalls pre-dawn/early morning; possible transboundary haze.
- [ ] Typical daytime highs 31–33°C, nights rarely below 24°C; Singapore ~140 km north of the equator (~1.3°N).
- [ ] "One of the highest rates of lightning activity in the world."

## Hawker centres (hawker guide, place pages)
Source: National Environment Agency (nea.gov.sg) hawker centre directory and cleaning schedule; UNESCO ich.unesco.org.
- [ ] **UNESCO**: "Hawker Culture in Singapore" inscribed on the Representative List of the Intangible Cultural Heritage of Humanity, December 2020.
- [ ] "More than 100 hawker centres" (NEA/government-linked count, currently ~120).
- [ ] Hawkers relocated into purpose-built centres from the late 1960s to the 1980s.
- [ ] **Tray return** mandatory since 2021 (enforcement from June 2021 at hawker centres; separate halal/non-halal return points).
- [ ] **Opening days and hours** for each centre listed: Maxwell, Chinatown Complex, Amoy Street (weekday focus; weekend closures), Tiong Bahru Market (morning; Monday stall closures), Tekka, Lau Pa Sat (long hours; satay street on Boon Tat Street from evening, earlier on weekends), Old Airport Road, East Coast Lagoon Food Village, Adam Road, Changi Village, Golden Mile, Newton.
- [ ] Periodic **cleaning closures** (typically quarterly, a few days each) and any long renovation closures, e.g. Golden Mile Food Centre or others currently under upgrading.
- [ ] Chinatown Complex Food Centre described as the largest hawker centre by number of stalls.
- [ ] Hygiene grades displayed at stalls; halal certificates displayed.

## Neighbourhood facts
- [ ] Jackson Plan 1822; five-foot way requirement from the 1820s town plan.
- [ ] Thian Hock Keng, Al-Abrar Mosque, Nagore Dargah locations and visiting.
- [ ] Sri Mariamman Temple founded 1827, oldest Hindu temple in Singapore.
- [ ] Buddha Tooth Relic Temple opened 2007; rooftop orchid garden.
- [ ] Sultan Mosque: first mosque 1820s; present building completed 1932; visiting hours and Friday prayer times; robes lent at entrance.
- [ ] **Malay Heritage Centre**: closed for redevelopment; confirm reopening date and hours.
- [ ] Haji Lane shops open around 11am.
- [ ] Sri Veeramakaliamman Temple founded 1850s.
- [ ] House of Tan Teng Niah built 1900; private building.
- [ ] Deepavali (Oct/Nov) and Thaipusam (Jan/Feb) timing; Thaipusam route.
- [ ] Katong: land reclamation 1960s–70s; Koon Seng Road terraces 1920s; Marine Parade and Katong Park MRT stations (Thomson-East Coast Line) open.
- [ ] East Coast Park ~15 km.
- [ ] Tiong Bahru: SIT flats 1936–1941; conserved 2003; Block 78 air-raid shelter tours; Qi Tian Gong.
- [ ] National Gallery Singapore: former Supreme Court and City Hall; largest public collection of modern Southeast Asian art; museum admission policies for visitors.
- [ ] Asian Civilisations Museum: Tang Shipwreck (9th century).
- [ ] Peranakan Museum (Armenian Street) reopened 2023.
- [ ] CityLink Mall underground connection City Hall ↔ Esplanade.
- [ ] Marina Barrage completed 2008; Marina Reservoir freshwater.
- [ ] Gardens by the Bay: outdoor gardens free; Cloud Forest and Flower Dome ticketed; Garden Rhapsody light show twice nightly (times).
- [ ] Marina Bay promenade loop ~3.5 km.

## Singapore Botanic Gardens
Source: nparks.gov.sg/sbg
- [ ] Founded 1859; UNESCO World Heritage Site 2015 (first in Singapore).
- [ ] Henry Ridley and rubber tapping.
- [ ] Gardens opening hours (5am–midnight daily) and free entry; National Orchid Garden hours and ticket.
- [ ] Rainforest patch (~6 ha), older than the gardens.
- [ ] Jacob Ballas Children's Garden hours and closure days.
- [ ] Botanic Gardens MRT (Circle and Downtown lines), Napier MRT (Thomson-East Coast Line) near Tanglin Gate.

## Nature reserves
Source: nparks.gov.sg
- [ ] Bukit Timah Hill 163 m, highest natural point; trail conditions and closures.
- [ ] **MacRitchie TreeTop Walk**: 250 m free-standing suspension bridge, ~25 m high; hours (typically 9am–5pm Tue–Fri, 8:30am–5pm weekends/PH) and **closed on Mondays** (except public holidays). Loop length ~11 km.
- [ ] Sungei Buloh Wetland Reserve: migratory season ~September–March; estuarine crocodiles; opening hours; Kranji entrance.
- [ ] Feeding wildlife (macaques) illegal under the Wildlife Act; fines.

## Southern Ridges
- [ ] Route ~10 km linking Mount Faber, Telok Blangah Hill, HortPark, Kent Ridge Park and Labrador Nature Reserve.
- [ ] Henderson Waves: highest pedestrian bridge in Singapore (~36 m); lit in the evenings (approx. 7pm–7am).
- [ ] Forest Walk, Alexandra Arch, Kent Ridge canopy walk; Reflections at Bukit Chandu.
- [ ] Mount Faber cable car (ticketed).

## Pulau Ubin
- [ ] **Bumboat** from Changi Point Ferry Terminal; departs when ~12 passengers board; ~10–15 minutes; operating hours (approx. 6am–7pm/9pm) and current fare (cash). The site deliberately states no fare.
- [ ] Bicycle rental in the village; Chek Jawa boardwalk hours; intertidal walks only with NParks guides at low tide.
- [ ] Ketam Mountain Bike Park.
- [ ] Number of remaining residents ("a few dozen").

## Mandai
Source: mandai.com
- [ ] Singapore Zoo opened 1973; Night Safari opened 1994; Bird Paradise opened 2023 (replacing Jurong Bird Park); River Wonders; Rainforest Wild ASIA (2025).
- [ ] **Bird Paradise hours** (approx. 9am–6pm) and **Night Safari hours** (approx. 7:15pm–midnight). Zoo approx. 8:30am–6pm. Confirm.
- [ ] Mandai Khatib Shuttle from Khatib MRT; Mandai Boardwalk free and open.
- [ ] Flash photography not allowed at the Night Safari.

## Park connectors
Source: NParks Park Connector Network
- [ ] "Over 300 km" network length (NParks figure; may now be higher).
- [ ] Route segments used in walks (Changi Point Coastal Walk ~2.2 km; East Coast Park underpasses from Marine Parade; Kent Ridge–HortPark–Mount Faber).

## Walk routes
- [ ] Each route in `content/en/pages/shade-walks.json` should be walked once to confirm distance, time, the shade type marked on each leg, and the storm shelters listed.

## Other
- [ ] Legal pages: confirm data retention periods (24 months enquiries; 5 years accounting records), the email provider used for enquiries, and the governing-law wording with a Singapore lawyer.
- [ ] Booking terms refer to deposits and cancellation charges "as stated in the written quote"; no amounts are published.
