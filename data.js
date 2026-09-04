const REGIONS = [
  { id: "africa", name: "Africa", note: "North, west, east, central and southern Africa", colour: "#bd5c3b" },
  { id: "europe", name: "Europe", note: "Atlantic, Mediterranean and Eurasian Europe", colour: "#496e88" },
  { id: "asia", name: "Asia", note: "West, central, south, east and southeast Asia", colour: "#8b6a34" },
  { id: "americas", name: "The Americas", note: "North, central and South America", colour: "#47745d" },
  { id: "oceania", name: "Oceania", note: "Australia, New Guinea and the Pacific", colour: "#6e5686" }
];

const HISTORY_ITEMS = [
  {
    id: "pyramids-giza", year: -2550, endYear: -2490, region: "africa", theme: "Building",
    title: "The pyramids rise at Giza", place: "Giza, Egypt", lat: 29.9792, lng: 31.1342,
    summary: "Workforces built monumental tombs for Khufu, Khafre and Menkaure on the Giza plateau.",
    body: "The pyramid complex was not simply three isolated monuments. Temples, causeways, cemeteries and a settlement for workers formed part of an organised landscape sustained by the Egyptian state.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Sphinx_and_the_Great_Pyramid_of_Giza_panorama.jpg?width=1200",
    imageAlt: "The Great Sphinx with the Great Pyramid of Giza behind it",
    imageCredit: "Kallerna, Wikimedia Commons (Creative Commons)",
    imageCreditUrl: "https://commons.wikimedia.org/wiki/File:Sphinx_and_the_Great_Pyramid_of_Giza_panorama.jpg",
    source: "UNESCO World Heritage Centre", sourceUrl: "https://whc.unesco.org/en/list/86/"
  },
  {
    id: "stonehenge", year: -2500, endYear: -2200, region: "europe", theme: "Belief",
    title: "Stonehenge takes its monumental form", place: "Wiltshire, Britain", lat: 51.1789, lng: -1.8262,
    summary: "Communities in prehistoric Britain raised the great sarsen circle and trilithons.",
    body: "The people who built Stonehenge were not ‘British’ in the modern sense. The monument was created in stages over many centuries and sat within a much larger ritual landscape.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Stonehenge2007_07_30.jpg?width=1200",
    imageAlt: "Stonehenge beneath a broad, cloudy sky",
    imageCredit: "garethwiscombe, Wikimedia Commons (CC BY 2.0)",
    imageCreditUrl: "https://commons.wikimedia.org/wiki/File:Stonehenge2007_07_30.jpg",
    source: "English Heritage", sourceUrl: "https://www.english-heritage.org.uk/visit/places/stonehenge/history-and-stories/history/"
  },
  {
    id: "indus-cities", year: -2500, endYear: -1900, region: "asia", theme: "Cities",
    title: "Planned cities flourish in the Indus valley", place: "Mohenjo-daro, present-day Pakistan", lat: 27.3242, lng: 68.1357,
    summary: "Mohenjo-daro and Harappa had gridded streets, wells and sophisticated drainage.",
    body: "The Indus civilisation supported large urban communities linked by shared forms of measurement, craft production and trade. Its script remains undeciphered, limiting what can be said about its political life.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Mohenjo-daro.jpg?width=1200",
    imageAlt: "Excavated brick ruins of Mohenjo-daro with the Great Bath in the foreground",
    imageCredit: "Saqib Qayyum, Wikimedia Commons (CC BY-SA 3.0)",
    imageCreditUrl: "https://commons.wikimedia.org/wiki/File:Mohenjo-daro.jpg",
    source: "UNESCO World Heritage Centre", sourceUrl: "https://whc.unesco.org/en/list/138/"
  },
  {
    id: "caral", year: -2600, endYear: -2000, region: "americas", theme: "Cities",
    title: "A ceremonial city grows at Caral", place: "Supe Valley, present-day Peru", lat: -10.8936, lng: -77.5203,
    summary: "Monumental platform mounds and sunken courts formed an early urban centre in the Americas.",
    body: "Caral was one of several settlements in the Norte Chico region. Its monumental architecture shows that complex social organisation was developing in the Andes while the Egyptian pyramids were being built.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/PeruCaral01.jpg?width=1200",
    imageAlt: "Ancient stepped pyramids at Caral in Peru's Supe Valley",
    imageCredit: "Håkan Svensson (Xauxa), Wikimedia Commons (CC BY-SA 3.0)",
    imageCreditUrl: "https://commons.wikimedia.org/wiki/File:PeruCaral01.jpg",
    source: "UNESCO World Heritage Centre", sourceUrl: "https://whc.unesco.org/en/list/1269/"
  },
  {
    id: "lapita", year: -1350, endYear: -750, region: "oceania", theme: "Migration",
    title: "Lapita voyagers move into the Pacific", place: "Bismarck Archipelago and western Pacific", lat: -4.3, lng: 152.0,
    summary: "Seafaring communities carried farming, languages and distinctive pottery eastwards.",
    body: "Lapita sites mark a major expansion of Austronesian-speaking peoples into Remote Oceania. Their navigational achievement connected islands across immense stretches of sea.",
    source: "Encyclopaedia Britannica", sourceUrl: "https://www.britannica.com/topic/Lapita-culture"
  },
  {
    id: "nubian-kerma", year: -1750, endYear: -1550, region: "africa", theme: "Power",
    title: "Kerma commands the Middle Nile", place: "Kerma, present-day Sudan", lat: 19.601, lng: 30.409,
    summary: "The kingdom of Kush centred on Kerma became a powerful rival and trading partner of Egypt.",
    body: "Kerma’s rulers controlled routes linking central Africa, the Red Sea and Egypt. Massive mud-brick structures known as deffufas still mark the capital.",
    source: "The Metropolitan Museum of Art", sourceUrl: "https://www.metmuseum.org/toah/hd/kerma/hd_kerma.htm"
  },
  {
    id: "shang", year: -1250, endYear: -1046, region: "asia", theme: "Writing",
    title: "Oracle bones record questions for Shang ancestors", place: "Anyang, present-day China", lat: 36.0976, lng: 114.3931,
    summary: "Diviners inscribed questions on bone and shell in the earliest substantial body of Chinese writing.",
    body: "The inscriptions name rulers, record rituals and ask about harvests, warfare, weather and childbirth. They connect archaeological evidence at Anyang with later accounts of the Shang dynasty.",
    source: "British Library", sourceUrl: "https://www.bl.uk/collection-items/chinese-oracle-bone"
  },
  {
    id: "olmec", year: -900, endYear: -400, region: "americas", theme: "Art",
    title: "Olmec sculptors carve colossal heads", place: "Gulf Coast, present-day Mexico", lat: 18.1, lng: -94.05,
    summary: "Large basalt portraits expressed power in major Gulf Coast centres.",
    body: "The heads probably represent rulers. Their stone was transported over long distances, demonstrating both technical skill and the ability to mobilise labour.",
    source: "Smarthistory", sourceUrl: "https://smarthistory.org/olmec-colossal-heads/"
  },
  {
    id: "athens", year: -450, endYear: -430, region: "europe", theme: "Politics",
    title: "Athens rebuilds the Acropolis", place: "Athens, Greece", lat: 37.9715, lng: 23.7267,
    summary: "The Parthenon was built during an era of Athenian democracy, empire and conflict.",
    body: "Citizens participated directly in political decisions, but women, enslaved people and resident foreigners were excluded. The building programme was entwined with Athenian imperial power.",
    source: "Acropolis Museum", sourceUrl: "https://www.theacropolismuseum.gr/en/parthenon"
  },
  {
    id: "aksum", year: 300, endYear: 400, region: "africa", theme: "Trade",
    title: "Aksum links inland Africa to the Red Sea", place: "Aksum, present-day Ethiopia", lat: 14.1211, lng: 38.7234,
    summary: "The Aksumite kingdom minted coins and traded across the Red Sea and Indian Ocean worlds.",
    body: "Aksum grew through agriculture and long-distance commerce. In the fourth century its ruler Ezana adopted Christianity, establishing a tradition that continues in Ethiopia.",
    source: "UNESCO World Heritage Centre", sourceUrl: "https://whc.unesco.org/en/list/15/"
  },
  {
    id: "roman-britain", year: 122, endYear: 140, region: "europe", theme: "Warfare",
    title: "Hadrian’s Wall crosses northern Britain", place: "Northern England", lat: 55.0247, lng: -2.2925,
    summary: "Roman soldiers and local workers created a frontier of forts, milecastles and walls.",
    body: "The wall was a controlled frontier rather than an impenetrable barrier. Movement, trade and cultural exchange continued across it.",
    source: "English Heritage", sourceUrl: "https://www.english-heritage.org.uk/visit/places/hadrians-wall/history-and-stories/history/"
  },
  {
    id: "teotihuacan", year: 400, endYear: 550, region: "americas", theme: "Cities",
    title: "Teotihuacan becomes one of the world’s largest cities", place: "Basin of Mexico", lat: 19.6925, lng: -98.8438,
    summary: "A planned metropolis of apartment compounds, temples and broad avenues housed a diverse population.",
    body: "Teotihuacan influenced societies far beyond central Mexico. Its original name and the identities of its rulers are unknown; the familiar name was given much later by the Mexica.",
    source: "UNESCO World Heritage Centre", sourceUrl: "https://whc.unesco.org/en/list/414/"
  },
  {
    id: "aboriginal-aquaculture", year: 500, endYear: 1000, region: "oceania", theme: "Food",
    title: "Gunditjmara communities manage eel aquaculture", place: "Budj Bim, Australia", lat: -38.06, lng: 141.88,
    summary: "Channels, weirs and ponds were used to manage water flows and harvest kooyang, or short-finned eel.",
    body: "The Budj Bim cultural landscape preserves evidence of a long-established Gunditjmara system for managing and storing a reliable food resource.",
    source: "UNESCO World Heritage Centre", sourceUrl: "https://whc.unesco.org/en/list/1577/"
  },
  {
    id: "baghdad", year: 800, endYear: 900, region: "asia", theme: "Knowledge",
    title: "Scholars translate and extend knowledge in Baghdad", place: "Baghdad, present-day Iraq", lat: 33.3152, lng: 44.3661,
    summary: "The Abbasid capital became a centre for scholarship drawing on Greek, Persian, Indian and other traditions.",
    body: "Translation was only one part of the intellectual activity associated with Abbasid Baghdad. Scholars made original contributions in mathematics, astronomy, medicine, philosophy and geography.",
    source: "Encyclopaedia Britannica", sourceUrl: "https://www.britannica.com/place/Baghdad"
  },
  {
    id: "great-zimbabwe", year: 1250, endYear: 1450, region: "africa", theme: "Trade",
    title: "Great Zimbabwe anchors a far-reaching trade network", place: "Present-day Zimbabwe", lat: -20.2675, lng: 30.9338,
    summary: "A major Shona centre grew rich through cattle, gold and links to Indian Ocean trade.",
    body: "Its dry-stone walls enclosed elite and ceremonial spaces. Colonial writers once denied African authorship; archaeology has firmly established that it was built by ancestors of Shona-speaking peoples.",
    source: "UNESCO World Heritage Centre", sourceUrl: "https://whc.unesco.org/en/list/364/"
  },
  {
    id: "polynesian-navigation", year: 1200, endYear: 1300, region: "oceania", theme: "Migration",
    title: "Polynesian voyagers settle Aotearoa", place: "Aotearoa New Zealand", lat: -38.5, lng: 176.5,
    summary: "Ocean-going navigators reached and settled the last major habitable landmass on Earth.",
    body: "Māori ancestors used deep knowledge of stars, swells, winds, birds and other environmental signs. Dating continues to be refined, but settlement was established by around 1300 CE.",
    source: "Te Ara — Encyclopedia of New Zealand", sourceUrl: "https://teara.govt.nz/en/history/page-1"
  },
  {
    id: "timbuktu", year: 1400, endYear: 1500, region: "africa", theme: "Knowledge",
    title: "Timbuktu thrives as a centre of learning and trade", place: "Timbuktu, present-day Mali", lat: 16.7666, lng: -3.0026,
    summary: "Scholars, merchants and manuscripts moved through a city linked to trans-Saharan networks.",
    body: "Timbuktu’s mosques and scholarly communities became renowned across the Islamic world. Surviving manuscript collections reveal wide-ranging work in law, theology, astronomy and other fields.",
    source: "UNESCO World Heritage Centre", sourceUrl: "https://whc.unesco.org/en/list/119/"
  },
  {
    id: "inca-roads", year: 1450, endYear: 1530, region: "americas", theme: "Power",
    title: "The Inka road system connects the Andes", place: "Andean South America", lat: -13.5, lng: -72.0,
    summary: "Roads, bridges and storehouses bound a vast mountain empire together without wheeled transport.",
    body: "The Qhapaq Ñan incorporated and expanded earlier routes. Runners carried information, while armies, officials and communities moved goods and labour across difficult terrain.",
    source: "UNESCO World Heritage Centre", sourceUrl: "https://whc.unesco.org/en/list/1459/"
  }
];
