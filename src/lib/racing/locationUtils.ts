import { horseNameToKey, placeToPlaceKey } from "./scores/funcs";

interface Location {
  latitude: number;
  longitude: number;
}

// UK racecourse coordinates
const COURSE_LOCATIONS: Record<string, Location> = {
  ascot: { latitude: 51.4131, longitude: -0.6769 },
  aintree: { latitude: 51.4809, longitude: -2.9441 },
  ayr: { latitude: 55.4589, longitude: -4.6179 },
  bangor: { latitude: 53.0739, longitude: -2.9115 },
  bath: { latitude: 51.3951, longitude: -2.3307 },
  beverley: { latitude: 53.8622, longitude: -0.4067 },
  brighton: { latitude: 50.8454, longitude: -0.0891 },
  carlisle: { latitude: 54.8952, longitude: -2.9189 },
  cartmel: { latitude: 54.2003, longitude: -2.9515 },
  catterick: { latitude: 54.3789, longitude: -1.6475 },
  chelmsford: { latitude: 51.7361, longitude: 0.4692 },
  cheltenham: { latitude: 51.922, longitude: -2.0702 },
  chepstow: { latitude: 51.6422, longitude: -2.6914 },
  doncaster: { latitude: 53.5184, longitude: -1.1147 },
  epsom: { latitude: 51.3059, longitude: -0.2525 },
  exeter: { latitude: 50.7197, longitude: -3.4915 },
  fakenham: { latitude: 52.8289, longitude: 0.8455 },
  "ffos-las": { latitude: 51.7253, longitude: -4.1835 },
  fontwell: { latitude: 50.8576, longitude: -0.6317 },
  goodwood: { latitude: 50.8978, longitude: -0.7472 },

  hamilton: { latitude: 55.7752, longitude: -4.0471 },
  haydock: { latitude: 53.4547, longitude: -2.6249 },
  hexham: { latitude: 54.9761, longitude: -2.0977 },
  huntingdon: { latitude: 52.3352, longitude: -0.1861 },
  kelso: { latitude: 55.6001, longitude: -2.4338 },
  kempton: { latitude: 51.4156, longitude: -0.3769 },
  leicester: { latitude: 52.6312, longitude: -1.0955 },
  lingfield: { latitude: 51.1748, longitude: -0.0161 },
  ludlow: { latitude: 52.3673, longitude: -2.7144 },
  "market-rasen": { latitude: 53.3853, longitude: -0.3362 },
  musselburgh: { latitude: 55.9464, longitude: -3.0509 },

  newbury: { latitude: 51.3993, longitude: -1.3002 },
  newcastle: { latitude: 54.9966, longitude: -1.6171 },
  newmarket: { latitude: 52.2429, longitude: 0.3807 },
  "newton-abbot": { latitude: 50.5297, longitude: -3.6116 },
  nottingham: { latitude: 52.9375, longitude: -1.1001 },
  perth: { latitude: 56.3954, longitude: -3.4339 },

  plumpton: { latitude: 50.9195, longitude: 0.0565 },
  pontefract: { latitude: 53.6914, longitude: -1.3095 },
  redcar: { latitude: 54.6198, longitude: -1.0708 },
  ripon: { latitude: 54.1375, longitude: -1.5274 },
  salisbury: { latitude: 51.0689, longitude: -1.7547 },
  sandown: { latitude: 51.3723, longitude: -0.3573 },
  sedgefield: { latitude: 54.6557, longitude: -1.4501 },
  southwell: { latitude: 53.0676, longitude: -0.9055 },
  stratford: { latitude: 52.1908, longitude: -1.7094 },
  taunton: { latitude: 51.0209, longitude: -3.0935 },
  thirsk: { latitude: 54.2328, longitude: -1.3397 },
  uttoxeter: { latitude: 52.9076, longitude: -1.8874 },
  warwick: { latitude: 52.2833, longitude: -1.5859 },
  wetherby: { latitude: 53.9461, longitude: -1.3845 },
  wolverhampton: { latitude: 52.5851, longitude: -2.1134 },
  worcester: { latitude: 52.1932, longitude: -2.2201 },
  yarmouth: { latitude: 52.6156, longitude: 1.7321 },
  york: { latitude: 53.9589, longitude: -1.0683 },
  wincanton: { latitude: 51.0553, longitude: -2.4095 },
  hereford: { latitude: 52.0505, longitude: -2.7641 },
  chester: { latitude: 53.1907, longitude: -2.8843 },
  windsor: { latitude: 51.4821, longitude: -0.6077 },
  "newmarket-july": { latitude: 52.2429, longitude: 0.3807 },
};

// Major UK training centers and locations
const TRAINER_LOCATIONS: Record<string, Location> = {
  // Newmarket trainers
  "charlie appleby": { latitude: 52.2429, longitude: 0.3807 },
  "john gosden": { latitude: 52.2429, longitude: 0.3807 },
  "william haggas": { latitude: 52.2429, longitude: 0.3807 },
  "sir michael stoute": { latitude: 52.2429, longitude: 0.3807 },
  "roger varian": { latitude: 52.2429, longitude: 0.3807 },
  "james fanshawe": { latitude: 52.2429, longitude: 0.3807 },
  "marco botti": { latitude: 52.2429, longitude: 0.3807 },
  "george boughey": { latitude: 52.2429, longitude: 0.3807 },
  "jane chapple-hyam": { latitude: 52.2429, longitude: 0.3807 },
  "charlie fellowes": { latitude: 52.2429, longitude: 0.3807 },
  "hugo palmer": { latitude: 52.2429, longitude: 0.3807 },
  "ed dunlop": { latitude: 52.2429, longitude: 0.3807 },

  // Lambourn trainers
  "nicky henderson": { latitude: 51.5275, longitude: -1.5145 },
  "clive cox": { latitude: 51.5275, longitude: -1.5145 },
  "owen burrows": { latitude: 51.5275, longitude: -1.5145 },
  "archie watson": { latitude: 51.5275, longitude: -1.5145 },
  "jamie snowden": { latitude: 51.5275, longitude: -1.5145 },
  "oliver sherwood": { latitude: 51.5275, longitude: -1.5145 },
  "warren greatrex": { latitude: 51.5275, longitude: -1.5145 },
  "charlie hills": { latitude: 51.5275, longitude: -1.5145 },

  // Middleham trainers
  "mark johnston": { latitude: 54.0056, longitude: -1.4662 },
  "karl burke": { latitude: 54.0056, longitude: -1.4662 },
  "james bethell": { latitude: 54.0056, longitude: -1.4662 },
  "ben haslam": { latitude: 54.0056, longitude: -1.4662 },
  "jedd o'keeffe": { latitude: 54.0056, longitude: -1.4662 },

  // Malton trainers
  "richard fahey": { latitude: 54.0931, longitude: -1.3474 },
  "tim easterby": { latitude: 54.0931, longitude: -1.3474 },
  "brian ellison": { latitude: 54.0931, longitude: -1.3474 },
  "john quinn": { latitude: 54.0931, longitude: -1.3474 },
  "kevin ryan": { latitude: 54.0931, longitude: -1.3474 },
  "roger fell": { latitude: 54.0931, longitude: -1.3474 },

  // Other UK locations
  "paul nicholls": { latitude: 51.0553, longitude: -2.4095 }, // Ditcheat
  "dan skelton": { latitude: 52.1674, longitude: -1.7863 }, // Alcester
  "andrew balding": { latitude: 51.2671, longitude: -1.2435 }, // Kingsclere
  "ralph beckett": { latitude: 51.2345, longitude: -1.3397 }, // Andover
  "richard hannon": { latitude: 51.3451, longitude: -1.6745 }, // Marlborough
  "alan king": { latitude: 51.4338, longitude: -1.9885 }, // Barbury Castle
  "philip hobbs": { latitude: 51.2877, longitude: -2.7704 }, // Minehead
  "david pipe": { latitude: 50.6687, longitude: -4.3234 }, // Nicholashayne
  "venetia williams": { latitude: 52.0505, longitude: -2.7641 }, // Hereford
  "donald mccain": { latitude: 53.1907, longitude: -2.8843 }, // Chester
  "michael dods": { latitude: 54.6239, longitude: -1.6789 }, // Darlington
  "fergal o'brien": { latitude: 51.9431, longitude: -1.9882 }, // Cheltenham
  "tom george": { latitude: 51.8871, longitude: -2.2749 }, // Stroud
  "gary moore": { latitude: 50.9334, longitude: -0.2818 }, // Lower Beeding
  "eve johnson houghton": { latitude: 51.5577, longitude: -1.2755 }, // Didcot
  "mick channon": { latitude: 51.5275, longitude: -1.5145 }, // Lambourn
  "emma lavelle": { latitude: 51.2345, longitude: -1.3397 }, // Andover
  "ruth jefferson": { latitude: 54.2329, longitude: -1.3397 }, // Thirsk

  // Irish trainers
  "willie mullins": { latitude: 52.8558, longitude: -6.9684 }, // Closutton
  "aidan o'brien": { latitude: 52.4877, longitude: -7.2207 }, // Ballydoyle
  "gordon elliott": { latitude: 53.4789, longitude: -6.8367 }, // Longwood
  "joseph o'brien": { latitude: 52.5441, longitude: -7.2368 }, // Piltown
  "henry de bromhead": { latitude: 52.1458, longitude: -7.6912 }, // Knockeen
  "jessica harrington": { latitude: 53.1824, longitude: -6.8163 }, // Moone
  "dermot weld": { latitude: 53.2543, longitude: -6.6671 }, // Curragh
  "ger lyons": { latitude: 53.4789, longitude: -6.8367 }, // Meath
  "gavin cromwell": { latitude: 53.6567, longitude: -6.6691 }, // Navan
  "john murphy": { latitude: 52.1371, longitude: -8.6466 }, // Cork

  // More Newmarket trainers
  "michael bell": { latitude: 52.2429, longitude: 0.3807 },
  "saeed bin suroor": { latitude: 52.2429, longitude: 0.3807 },
  "david simcock": { latitude: 52.2429, longitude: 0.3807 },
  "stuart williams": { latitude: 52.2429, longitude: 0.3807 },
  "chris wall": { latitude: 52.2429, longitude: 0.3807 },
  "amy murphy": { latitude: 52.2429, longitude: 0.3807 },

  // More Lambourn trainers
  "joe tuite": { latitude: 51.5275, longitude: -1.5145 },
  "daniel kubler": { latitude: 51.5275, longitude: -1.5145 },
  "dominic ffrench davis": { latitude: 51.5275, longitude: -1.5145 },
  "henry candy": { latitude: 51.5275, longitude: -1.5145 },

  // More Yorkshire trainers
  "david o'meara": { latitude: 54.0931, longitude: -1.3474 }, // Malton
  "julie camacho": { latitude: 54.0931, longitude: -1.3474 }, // Malton
  "mick easterby": { latitude: 54.0931, longitude: -1.3474 }, // Malton
  "nigel tinkler": { latitude: 54.0931, longitude: -1.3474 }, // Malton
  "philip kirby": { latitude: 54.4465, longitude: -1.6744 }, // Catterick
  "adrian keatley": { latitude: 54.0056, longitude: -1.4662 }, // Middleham
  "ann duffield": { latitude: 54.0056, longitude: -1.4662 }, // Middleham

  // More independent locations
  "ian williams": { latitude: 52.1908, longitude: -1.7094 }, // Stratford
  "ollie murphy": { latitude: 52.1674, longitude: -1.7863 }, // Alcester
  "ben pauling": { latitude: 51.9431, longitude: -1.9882 }, // Cheltenham
  "milton harris": { latitude: 51.3532, longitude: -2.0281 }, // Warminster
  "george scott": { latitude: 52.2429, longitude: 0.3807 }, // Newmarket
  "simon & ed crisford": { latitude: 52.2429, longitude: 0.3807 }, // Newmarket
  "harry fry": { latitude: 50.9401, longitude: -2.7543 }, // Dorset
  "christian williams": { latitude: 51.6027, longitude: -3.7352 }, // Glamorgan
  "sam thomas": { latitude: 51.4805, longitude: -3.2527 }, // Cardiff
  "rebecca curtis": { latitude: 51.9927, longitude: -4.9703 }, // Newport

  // More Irish trainers
  "peter fahey": { latitude: 53.1371, longitude: -6.8163 }, // Kildare
  "noel meade": { latitude: 53.6567, longitude: -6.6691 }, // Navan
  "tony martin": { latitude: 53.4563, longitude: -6.2489 }, // Dublin
  "edward o'grady": { latitude: 52.3559, longitude: -7.6947 }, // Tipperary
  "john kiely": { latitude: 52.3559, longitude: -7.6947 }, // Tipperary
  "martin brassil": { latitude: 53.1824, longitude: -6.8163 }, // Kildare

  // More Newmarket trainers
  "james ferguson": { latitude: 52.2429, longitude: 0.3807 },
  "alice haynes": { latitude: 52.2429, longitude: 0.3807 },
  "kevin philippart de foy": { latitude: 52.2429, longitude: 0.3807 },
  "harry eustace": { latitude: 52.2429, longitude: 0.3807 },
  "tom clover": { latitude: 52.2429, longitude: 0.3807 },
  "robert cowell": { latitude: 52.2429, longitude: 0.3807 },

  // More Lambourn trainers
  "ed walker": { latitude: 51.5275, longitude: -1.5145 },
  "richard hughes": { latitude: 51.5275, longitude: -1.5145 },
  "stan moore": { latitude: 51.5275, longitude: -1.5145 },
  "brendan powell": { latitude: 51.5275, longitude: -1.5145 },

  // More Yorkshire trainers
  "adrian paul keatley": { latitude: 54.0056, longitude: -1.4662 }, // Middleham
  "danny brooke": { latitude: 54.0931, longitude: -1.3474 }, // Malton
  "les eyre": { latitude: 54.0931, longitude: -1.3474 }, // Malton
  "paul midgley": { latitude: 54.0931, longitude: -1.3474 }, // Malton

  // More independent locations
  "neil mulholland": { latitude: 51.3532, longitude: -2.0281 }, // Wiltshire
  "joe tizzard": { latitude: 50.9401, longitude: -2.7543 }, // Dorset
  "anthony honeyball": { latitude: 50.9401, longitude: -2.7543 }, // Dorset
  "jane williams": { latitude: 50.7197, longitude: -3.4915 }, // Devon
  "nick williams": { latitude: 50.7197, longitude: -3.4915 }, // Devon
  "jeremy scott": { latitude: 51.0209, longitude: -3.0935 }, // Somerset
  "david dennis": { latitude: 52.0505, longitude: -2.7641 }, // Hereford
  "jonjo o'neill": { latitude: 51.9431, longitude: -1.9882 }, // Cheltenham
  "nigel twiston-davies": { latitude: 51.9431, longitude: -1.9882 }, // Cheltenham
  "kim bailey": { latitude: 51.9431, longitude: -1.9882 }, // Cheltenham
  "martin keighley": { latitude: 51.9431, longitude: -1.9882 }, // Cheltenham
  "david loughnane": { latitude: 52.9076, longitude: -1.8874 }, // Uttoxeter
  "oliver greenall": { latitude: 53.1907, longitude: -2.8843 }, // Chester
  "tom dascombe": { latitude: 53.1907, longitude: -2.8843 }, // Chester
  "hugo froud": { latitude: 51.0689, longitude: -1.7547 }, // Salisbury

  // More Irish trainers
  "paul nolan": { latitude: 52.5441, longitude: -7.2368 }, // Piltown
  "charles byrnes": { latitude: 52.3559, longitude: -7.6947 }, // Tipperary
  "emmet mullins": { latitude: 52.8558, longitude: -6.9684 }, // Closutton

  "thomas mullins": { latitude: 52.8558, longitude: -6.9684 }, // Closutton
  "tony mullins": { latitude: 52.8558, longitude: -6.9684 }, // Closutton
  "patrick flynn": { latitude: 52.1371, longitude: -8.6466 }, // Cork
  "john ryan": { latitude: 52.3559, longitude: -7.6947 }, // Tipperary
  "denis hogan": { latitude: 52.3559, longitude: -7.6947 }, // Tipperary
  "andy slattery": { latitude: 52.3559, longitude: -7.6947 }, // Tipperary
  "john patrick ryan": { latitude: 52.3559, longitude: -7.6947 }, // Tipperary
  "paddy twomey": { latitude: 52.3559, longitude: -7.6947 }, // Tipperary
  "johnny murtagh": { latitude: 53.2543, longitude: -6.6671 }, // Curragh
  "michael o'callaghan": { latitude: 53.2543, longitude: -6.6671 }, // Curragh
  "ken condon": { latitude: 53.2543, longitude: -6.6671 }, // Curragh

  // More Cotswolds/Oxfordshire trainers
  "charlie longsdon": { latitude: 51.9431, longitude: -1.5405 }, // Chipping Norton
  "ben case": { latitude: 51.9798, longitude: -1.4559 }, // Banbury
  "alex hales": { latitude: 52.0411, longitude: -1.3415 }, // Edgcote
  "richard phillips": { latitude: 51.9431, longitude: -1.9882 }, // Adlestrop

  // More Lambourn trainers
  "harry whittington": { latitude: 51.5275, longitude: -1.5145 },
  "pat murphy": { latitude: 51.5275, longitude: -1.5145 },
  "grant moore": { latitude: 51.5275, longitude: -1.5145 },

  // More independent locations
  "lucinda russell": { latitude: 56.2082, longitude: -3.4249 }, // Kinross
  "keith dalgleish": { latitude: 55.6776, longitude: -3.7797 }, // Carluke
  "sandy thomson": { latitude: 55.6474, longitude: -2.4154 }, // Kelso
  "iain jardine": { latitude: 55.0833, longitude: -3.3333 }, // Dumfries
  "nick alexander": { latitude: 56.3567, longitude: -3.3139 }, // Perth
  "stuart edmunds": { latitude: 52.0873, longitude: -0.7282 }, // Newport Pagnell
  "caroline bailey": { latitude: 52.4333, longitude: -0.8333 }, // Northampton

  // Additional Flat trainers
  "michael appleby": { latitude: 52.9076, longitude: -1.8874 }, // Oakham
  "tony carroll": { latitude: 52.0505, longitude: -2.7641 }, // Worcestershire
  "antony brittain": { latitude: 53.6914, longitude: -1.3095 }, // Pontefract
  "gay kelleway": { latitude: 52.2429, longitude: 0.3807 }, // Newmarket
  "michael wigham": { latitude: 52.2429, longitude: 0.3807 }, // Newmarket
  "david evans": { latitude: 51.6422, longitude: -2.6914 }, // Chepstow
  "phil mcentee": { latitude: 52.2429, longitude: 0.3807 }, // Newmarket
  "john butler": { latitude: 52.2429, longitude: 0.3807 }, // Newmarket
  "james tate": { latitude: 52.2429, longitude: 0.3807 }, // Newmarket
  "ivan furtado": { latitude: 53.0676, longitude: -0.9055 }, // Southwell
  "alexandra dunn": { latitude: 51.3532, longitude: -2.0281 }, // Westbury

  // Additional Jump trainers
  "evan williams": { latitude: 51.6027, longitude: -3.7352 }, // Vale of Glamorgan
  "tim vaughan": { latitude: 51.4805, longitude: -3.2527 }, // Cardiff
  "nicky richards": { latitude: 54.8952, longitude: -2.9189 }, // Carlisle
  "micky hammond": { latitude: 54.0056, longitude: -1.4662 }, // Middleham
  "sue smith": { latitude: 53.8622, longitude: -1.6475 }, // Bingley
  "michael scudamore": { latitude: 51.9431, longitude: -1.9882 }, // Cheltenham
  "sam england": { latitude: 53.8622, longitude: -1.6475 }, // Bradford
  "susan gardner": { latitude: 52.0505, longitude: -2.7641 }, // Herefordshire
  "zoe davison": { latitude: 50.9334, longitude: -0.2818 }, // East Grinstead

  // Update A P O'Brien to match listing format
  "a p o brien": { latitude: 52.4877, longitude: -7.2207 }, // Ballydoyle

  // Scotland trainers
  "n w alexander": { latitude: 56.3567, longitude: -3.3139 }, // Perth
  "jim goldie": { latitude: 55.9464, longitude: -3.0509 }, // Musselburgh
  "stuart coltherd": { latitude: 55.6001, longitude: -2.4338 }, // Kelso
  "donald whillans": { latitude: 55.6001, longitude: -2.4338 }, // Kelso
  "ewan whillans": { latitude: 55.6001, longitude: -2.4338 }, // Kelso
  "sandy forster": { latitude: 55.6001, longitude: -2.4338 }, // Kelso
  "george bewley": { latitude: 54.8952, longitude: -2.9189 }, // Carlisle
  "james moffatt": { latitude: 54.2003, longitude: -2.9515 }, // Cartmel
  "ian duncan": { latitude: 56.2082, longitude: -3.4249 }, // Kinross

  // Northern trainers
  "ruth carr": { latitude: 54.0931, longitude: -1.3474 }, // Malton
  "rebecca menzies": { latitude: 54.6557, longitude: -1.4501 }, // Sedgefield
  "r mike smith": { latitude: 54.6557, longitude: -1.4501 }, // Sedgefield
  "k r burke": { latitude: 54.0056, longitude: -1.4662 }, // Middleham
  "charlie johnston": { latitude: 54.0056, longitude: -1.4662 }, // Middleham

  // Irish trainers
  "s r b crawford": { latitude: 54.4435, longitude: -6.4035 }, // County Antrim

  // Midlands trainers
  "oliver greenall & josh guerriero": { latitude: 53.1907, longitude: -2.8843 }, // Chester
  "james evans": { latitude: 52.3673, longitude: -2.7144 }, // Ludlow
  "adrian wintle": { latitude: 52.0505, longitude: -2.7641 }, // Hereford
  "shaun lycett": { latitude: 52.0505, longitude: -2.7641 }, // Hereford
  "mark loughnane": { latitude: 52.5851, longitude: -2.1134 }, // Wolverhampton
  "derek shaw": { latitude: 52.6312, longitude: -1.0955 }, // Leicester
  "john mackie": { latitude: 52.9375, longitude: -1.1001 }, // Nottingham
  "kevin frost": { latitude: 52.9375, longitude: -1.1001 }, // Nottingham

  // Southern trainers
  "gary & josh moore": { latitude: 50.9334, longitude: -0.2818 }, // Lower Beeding
  "nick gifford": { latitude: 50.9195, longitude: 0.0565 }, // Plumpton
  "olly murphy": { latitude: 52.1674, longitude: -1.7863 }, // Alcester
  "jamie osborne": { latitude: 51.5275, longitude: -1.5145 }, // Lambourn
  "jonathan portman": { latitude: 51.5275, longitude: -1.5145 }, // Lambourn
  "joe tickle": { latitude: 50.5297, longitude: -3.6116 }, // Newton Abbot
  "rod millman": { latitude: 50.5297, longitude: -3.6116 }, // Newton Abbot
  "grace harris": { latitude: 51.6027, longitude: -3.7352 }, // Vale of Glamorgan
  "chris gordon": { latitude: 51.0689, longitude: -1.7547 }, // Salisbury
  "tom lacey": { latitude: 52.1908, longitude: -1.7094 }, // Stratford

  // Newmarket trainers
  "james owen": { latitude: 52.2429, longitude: 0.3807 },
  "darryll holland": { latitude: 52.2429, longitude: 0.3807 },

  // Other trainers
  "jack morland": { latitude: 53.0676, longitude: -0.9055 }, // Southwell
  "dylan cunha": { latitude: 52.2429, longitude: 0.3807 }, // Newmarket
  "patrick morris": { latitude: 53.1907, longitude: -2.8843 }, // Chester
  "scott dixon": { latitude: 52.9375, longitude: -1.1001 }, // Nottingham
  "paul attwater": { latitude: 51.3532, longitude: -2.0281 }, // Westbury
  "michael attwater": { latitude: 51.3532, longitude: -2.0281 }, // Westbury
  "b f brookhouse": { latitude: 52.0505, longitude: -2.7641 }, // Hereford
  "daisy hitchins": { latitude: 51.0689, longitude: -1.7547 }, // Salisbury
  "j r jenkins": { latitude: 51.5275, longitude: -1.5145 }, // Lambourn
  "ben lund": { latitude: 52.2429, longitude: 0.3807 }, // Newmarket
  "michael keady": { latitude: 53.0676, longitude: -0.9055 }, // Southwell
  "joseph parr": { latitude: 52.5851, longitude: -2.1134 }, // Wolverhampton
  "john gallagher": { latitude: 51.1748, longitude: -0.0161 }, // Lingfield
  "gerald stephen quinn": { latitude: 54.9966, longitude: -1.6171 }, // Newcastle
  "brian toomey": { latitude: 54.0931, longitude: -1.3474 }, // Malton
  "stella barclay": { latitude: 54.0931, longitude: -1.3474 }, // Malton
  "chelsea banham": { latitude: 52.6156, longitude: 1.7321 }, // Great Yarmouth
  "anthony carson": { latitude: 54.9966, longitude: -1.6171 }, // Newcastle
  "ian mcinnes": { latitude: 55.4589, longitude: -4.6179 }, // Ayr
  "lisa williamson": { latitude: 52.9375, longitude: -1.1001 }, // Nottingham
  "paddy butler": { latitude: 52.3673, longitude: -2.7144 }, // Ludlow
  "jonjo & a j o'neill": { latitude: 51.9431, longitude: -1.9882 }, // Cheltenham

  // Southern trainers
  "richard j bandey": { latitude: 51.2345, longitude: -1.3397 }, // Hampshire
  "robert walford": { latitude: 50.9401, longitude: -2.7543 }, // Dorset
  "max comley": { latitude: 51.0689, longitude: -1.7547 }, // Salisbury
  "lydia richards": { latitude: 50.9334, longitude: -0.2818 }, // Sussex
  "pat phelan": { latitude: 51.5275, longitude: -1.5145 }, // Lambourn
  "emma-jane bishop": { latitude: 51.3532, longitude: -2.0281 }, // Westbury
  "matt crawley": { latitude: 52.2429, longitude: 0.3807 }, // Newmarket
  "harry charlton": { latitude: 51.2345, longitude: -1.3397 }, // Andover

  // Midlands trainers
  "tom gretton": { latitude: 52.0505, longitude: -2.7641 }, // Herefordshire
  "ryan potter": { latitude: 52.0505, longitude: -2.7641 }, // Herefordshire
  "katy price": { latitude: 52.0505, longitude: -2.7641 }, // Herefordshire
  "harriet dickin": { latitude: 52.1908, longitude: -1.7094 }, // Stratford
  "d j jeffreys": { latitude: 52.0505, longitude: -2.7641 }, // Herefordshire

  // Northern trainers
  "dianne sayer": { latitude: 54.8952, longitude: -2.9189 }, // Carlisle
  "andrew hamilton": { latitude: 54.8952, longitude: -2.9189 }, // Carlisle
  "lizzie quinlan": { latitude: 54.9966, longitude: -1.6171 }, // Newcastle
  "james ewart": { latitude: 55.6001, longitude: -2.4338 }, // Kelso
  "jackie stephen": { latitude: 57.1497, longitude: -2.1383 }, // Aberdeen
  "susan corbett": { latitude: 55.6474, longitude: -2.4154 }, // Kelso
  "jane walton": { latitude: 54.4465, longitude: -1.6744 }, // Catterick
  "gary brown": { latitude: 54.0931, longitude: -1.3474 }, // Malton
  "leonard kerr": { latitude: 55.0833, longitude: -3.3333 }, // Dumfries

  // Irish trainers
  "patrick neville": { latitude: 52.3559, longitude: -7.6947 }, // Tipperary
  "s mcparlan": { latitude: 54.4435, longitude: -6.4035 }, // County Antrim
  "daragh bourke": { latitude: 53.4789, longitude: -6.8367 }, // Meath
  "noel c kelly": { latitude: 53.4789, longitude: -6.8367 }, // Meath

  // Partnership updates
  "kim bailey & mat nicholls": { latitude: 51.9431, longitude: -1.9882 }, // Cheltenham
  "philip hobbs & johnson white": { latitude: 51.2877, longitude: -2.7704 }, // Minehead

  // Other trainers
  "cynthia woods": { latitude: 52.9375, longitude: -1.1001 }, // Nottingham
  "catch bissett": { latitude: 54.9966, longitude: -1.6171 }, // Newcastle
  "tony forbes": { latitude: 54.9966, longitude: -1.6171 }, // Newcastle
  "danni o'neill": { latitude: 53.1907, longitude: -2.8843 }, // Chester

  // Newmarket trainers
  "john & thady gosden": { latitude: 52.2429, longitude: 0.3807 },
  "charles hills": { latitude: 52.2429, longitude: 0.3807 },
  "charlie clover": { latitude: 52.2429, longitude: 0.3807 },
  "george margarson": { latitude: 52.2429, longitude: 0.3807 },
  "william stone": { latitude: 52.2429, longitude: 0.3807 },
  "ismail mohammed": { latitude: 52.2429, longitude: 0.3807 },

  // Yorkshire trainers
  "peter niven": { latitude: 54.0931, longitude: -1.3474 }, // Malton
  "julia & shelley birkett": { latitude: 54.0931, longitude: -1.3474 }, // Malton
  "joel parkinson & sue smith": { latitude: 53.9461, longitude: -1.3845 }, // Wetherby
  "michael herrington": { latitude: 54.0931, longitude: -1.3474 }, // Malton
  "michael & david easterby": { latitude: 54.0931, longitude: -1.3474 }, // Malton
  "mark walford": { latitude: 54.0931, longitude: -1.3474 }, // Malton
  "seb spencer": { latitude: 54.0931, longitude: -1.3474 }, // Malton

  // Midlands trainers
  "roy bowring": { latitude: 52.9375, longitude: -1.1001 }, // Nottingham
  "nick kent": { latitude: 53.2273, longitude: -0.5351 }, // Lincoln
  "jennie candlish": { latitude: 53.1261, longitude: -1.8558 }, // Baslow
  "henry daly": { latitude: 52.5851, longitude: -2.1134 }, // Wolverhampton

  // East Anglia trainers
  "pam sly": { latitude: 52.4334, longitude: -0.2462 }, // Peterborough
  "lucy wadham": { latitude: 52.2429, longitude: 0.3807 }, // Newmarket region

  // Southern trainers
  "harry derham": { latitude: 51.2345, longitude: -1.3397 }, // Hampshire
  "seamus mullins": { latitude: 51.0689, longitude: -1.7547 }, // Salisbury
  "george baker": { latitude: 51.2345, longitude: -1.3397 }, // Hampshire
  "simon dow": { latitude: 51.3723, longitude: -0.3573 }, // Epsom
  "lemos de souza": { latitude: 51.3723, longitude: -0.3573 }, // Epsom
  "michael madgwick": { latitude: 50.8429, longitude: -0.1273 }, // Brighton
  "tom ward": { latitude: 51.5275, longitude: -1.5145 }, // Lambourn
  "mark usher": { latitude: 51.5275, longitude: -1.5145 }, // Lambourn
  "martin dunne": { latitude: 51.5275, longitude: -1.5145 }, // Lambourn
  "d donovan": { latitude: 51.3723, longitude: -0.3573 }, // Epsom
  "j s moore": { latitude: 51.3723, longitude: -0.3573 }, // Epsom
  "dr richard newland & jamie insole": {
    latitude: 52.1932,
    longitude: -2.2201,
  }, // Worcester
  "roger teal": { latitude: 51.5275, longitude: -1.5145 }, // Lambourn
  "jack jones": { latitude: 52.1932, longitude: -2.2201 }, // Worcester
  "jack channon": { latitude: 51.5275, longitude: -1.5145 }, // Lambourn
  "mark hoad": { latitude: 51.3723, longitude: -0.3573 }, // Epsom
  "keiran burke": { latitude: 50.9401, longitude: -2.7543 }, // Dorset
  "karen jewell": { latitude: 51.3723, longitude: -0.3573 }, // Epsom
  "daniel steele": { latitude: 51.3723, longitude: -0.3573 }, // Epsom
  "laura mongan": { latitude: 51.3723, longitude: -0.3573 }, // Epsom
  "mark pattinson": { latitude: 51.3723, longitude: -0.3573 }, // Epsom
  "charlie wallis": { latitude: 51.3723, longitude: -0.3573 }, // Epsom

  // Northern trainers
  "tristan davidson": { latitude: 54.8952, longitude: -2.9189 }, // Carlisle
  "t ellis": { latitude: 54.9966, longitude: -1.6171 }, // Newcastle
  "liam bailey": { latitude: 54.9966, longitude: -1.6171 }, // Newcastle
  "paul collins": { latitude: 54.9966, longitude: -1.6171 }, // Newcastle
  "michael mullineaux": { latitude: 53.1907, longitude: -2.8843 }, // Chester
  "simon west": { latitude: 54.9966, longitude: -1.6171 }, // Newcastle

  // Yorkshire trainers (add to existing Yorkshire section)
  "john & sean quinn": { latitude: 54.0931, longitude: -1.3474 }, // Malton
  "edward bethell": { latitude: 54.0931, longitude: -1.3474 }, // Malton
  "james horton": { latitude: 54.0931, longitude: -1.3474 }, // Malton
  "craig lidster": { latitude: 54.0931, longitude: -1.3474 }, // Malton

  // Southern trainers (add to existing Southern section)
  "heather main": { latitude: 51.5275, longitude: -1.5145 }, // Lambourn
  "miss katy brown": { latitude: 51.5275, longitude: -1.5145 }, // Lambourn
  "alison hamilton": { latitude: 51.5275, longitude: -1.5145 }, // Lambourn
};

export function getCourseLocation(venue: string): Location | null {
  const normalizedVenue = placeToPlaceKey(venue);
  const key = Object.keys(COURSE_LOCATIONS).find(
    (k) => placeToPlaceKey(k) === normalizedVenue
  );
  const location = key ? COURSE_LOCATIONS[key] : null;
  if (!location) {
    console.log(
      `Warning: No location found for course: input: ${venue} -> normalized: ${normalizedVenue} -> key: ${key}`
    );
  }
  return location;
}

export function getTrainerLocation(trainerName: string): Location | null {
  const normalizedName = horseNameToKey(trainerName);
  const key = Object.keys(TRAINER_LOCATIONS).find(
    (k) => horseNameToKey(k) === normalizedName
  );
  const location = key ? TRAINER_LOCATIONS[key] : null;
  if (!location) {
    console.log(
      `Warning: No location found for trainer: input: ${trainerName} -> normalized: ${normalizedName} -> key: ${key}`
    );
  }
  return location;
}
