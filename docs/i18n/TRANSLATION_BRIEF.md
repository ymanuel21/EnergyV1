# EBT Plaza — English Translation Brief (term base + rules)

This file is the **single source of that truth** for wording. Every translator (human or agent)
must follow it so the same Indonesian label never becomes two different English labels.

## 1. Non-negotiable rules

1. **No invention.** Translate only what is written. Never add a specification, number, unit,
   certification, claim, dimension, or warranty that is not in the source.
2. **Numbers are immutable.** Every digit string, decimal ("5,12 kWh"), range, tolerance, model
   code, certification code and unit must survive byte-for-byte character-for-character.
   Only the surrounding words change.
3. **Structure is immutable.** Keep line count, blank lines, bullet markers (`*`, `•`, `-`) and
   headings exactly where they are. Translate the text, never the shape.
4. **Preserve proper nouns.** Brand, company and product names (`DEYE`, `LONGi`, `Huawei`,
   `Sungrow`, `EcoFlow`, `BEZVOLT`, `Sun Star`, …), model codes, and URLs stay as-is.
5. **Use the term base below.** If a label is listed, use the listed English exactly —
   including capitalisation and abbreviation style.
6. **Markdown/HTML stays.** If the source uses HTML tags or `**bold**`, keep the tags and
   translate only the human-readable text inside them.
7. **Natural, professional English.** Rewrite awkward literal phrasing into idiomatic technical
   English of the kind found in a manufacturer datasheet. Do not translate word-by-word.
8. **Unit style.** Keep the source's units. Do not convert. Use a non-breaking-looking regular
   space between number and unit only if the source had one.
9. Output **valid JSON only**, matching the contract given in the task.

## 2. Term base — spec-sheet labels

| Indonesian | English |
| --- | --- |
| Pendinginan | Cooling |
| Dimensi (HxWxD) | Dimensions (H×W×D) |
| Dimensi (Tinggi x Lebar x Dalam) | Dimensions (H × W × D) |
| Dimensi (Lebar x Tinggi x Dalam) | Dimensions (W × H × D) |
| Proteksi Terintegrasi | Integrated Protection |
| Sistem Proteksi Terintegrasi | Integrated Protection System |
| Sistem Proteksi Utama | Main Protection System |
| Proteksi | Protection |
| Berat | Weight |
| Berat Unit | Unit Weight |
| Berat Unit PDU | PDU Unit Weight |
| Kelembapan Relatif | Relative Humidity |
| Suhu operasi / Suhu Operasi | Operating Temperature |
| Suhu Penyimpanan | Storage Temperature |
| Suhu Operasi Pengisian / (Charge) | Charging Operating Temperature |
| Suhu Operasi Pelepasan / (Discharge) | Discharging Operating Temperature |
| Maksimal ketinggian operasi | Maximum Operating Altitude |
| Ketinggian operasi maks. | Max. Operating Altitude |
| Kebisingan | Noise Level |
| Tingkat Kebisingan | Noise Level |
| Daya nominal AC (grid output) | Rated AC Power (grid output) |
| Efisiensi maksimum / efisiensi Eropa | Maximum Efficiency / European Efficiency |
| Efisiensi Maksimum | Maximum Efficiency |
| Efisiensi Euro | European Efficiency |
| Efisiensi MPPT | MPPT Efficiency |
| Efisiensi modul | Module Efficiency |
| Jumlah MPPT / Jumlah string per MPPT | Number of MPPTs / Strings per MPPT |
| Tegangan input PV maks. | Max. PV Input Voltage |
| Rentang tegangan MPPT | MPPT Voltage Range |
| Tegangan start-up / Tegangan Awal | Start-up Voltage |
| Arus input PV maks. | Max. PV Input Current |
| Nominal tegangan AC / Nominal Tegangan AC / Tegangan Nominal AC | Rated AC Voltage |
| Arus output AC maks. | Max. AC Output Current |
| Tipe Inverter | Inverter Type |
| Komunikasi | Communication |
| Tipe Baterai | Battery Type |
| Maksimum daya PV input | Max. PV Input Power |
| Maksimum daya PV input rekomendasi | Recommended Max. PV Input Power |
| Monitoring & Kontrol | Monitoring & Control |
| Fitur Unggulan / Fitur Utama | Key Features |
| Kompatibilitas Baterai | Battery Compatibility |
| Daya Masukan PV Maksimum | Max. PV Input Power |
| Tegangan Masukan PV Maksimum | Max. PV Input Voltage |
| Rentang Tegangan MPPT | MPPT Voltage Range |
| Jumlah MPPT / Jumlah String per MPPT | Number of MPPTs / Strings per MPPT |
| Arus Masukan PV Maksimum | Max. PV Input Current |
| Arus Hubung Singkat PV Maksimum | Max. PV Short-Circuit Current |
| Rentang Tegangan Baterai | Battery Voltage Range |
| Arus Pengisian Maksimum | Max. Charging Current |
| Arus Pelepasan Maksimum | Max. Discharging Current |
| Daya Nominal AC Output | Rated AC Output Power |
| Daya Maksimum AC Output | Max. AC Output Power |
| Arus Nominal Keluaran AC | Rated AC Output Current |
| Arus Maksimum Keluaran AC | Max. AC Output Current |
| Rentang Tegangan AC Grid | AC Grid Voltage Range |
| Frekuensi Grid | Grid Frequency |
| Daya Output AC Kontinu Off-Grid | Continuous Off-Grid AC Output Power |
| Arus Output AC Off-Grid Nominal | Rated Off-Grid AC Output Current |
| Arus Peak Off-Grid Output | Off-Grid Peak Output Current |
| Waktu Perpindahan Switchover | Switchover Time |
| Paralel Ekspansi / Pararel Ekspansi | Parallel Expansion |
| Komunikasi ke BMS / Cloud | Communication to BMS / Cloud |
| Antarmuka Layar | Display Interface |
| Manajemen Beban Tambahan | Additional Load Management |
| Tegangan Operasi Baterai | Battery Operating Voltage |
| Rentang Tegangan PV Beban Penuh | Full-Load PV Voltage Range |
| Sensor Suhu Baterai Terintegrasi | Integrated Battery Temperature Sensor |
| Manajemen Baterai | Battery Management |
| Output Back-Up AC (Off-Grid Mode) | AC Backup Output (Off-Grid Mode) |
| Arus pengisian / pengosongan baterai maks. | Max. Battery Charge / Discharge Current |
| Waktu switching backup | Backup Switching Time |
| Daya Pengisian/Pelepasan Baterai Maks. | Max. Battery Charge/Discharge Power |
| Arus Pengisian / Pelepasan Maksimum | Max. Charge / Discharge Current |
| Arus Pengisian / Pelepasan Nominal | Rated Charge / Discharge Current |
| Arus Pengisian / Pelepasan Direkomendasikan | Recommended Charge / Discharge Current |
| Strategi Pengisian | Charging Strategy |
| Strategi Pengisian Baterai Li-ion | Li-ion Battery Charging Strategy |
| Komunikasi ke Inverter | Communication to Inverter |
| Kapasitas Nominal | Rated Capacity |
| Indikator Status | Status Indicator |
| Arus Operasi Baterai Maks. | Max. Battery Operating Current |
| Energi Nominal Baterai | Rated Battery Energy |
| Energi Nominal per Modul | Rated Energy per Module |
| Tegangan Nominal | Rated Voltage |
| Tegangan Nominal per Modul | Rated Voltage per Module |
| Material Casing | Casing Material |
| Material Enclosure | Enclosure Material |
| Fungsi Utama | Main Function |
| Fungsi Utama Sistem Solar | Main Solar System Function |
| Metode Pemasangan | Installation Method |
| Display / Indikator | Display / Indicators |
| Layar Display | Display Screen |
| Arus Peak Pelepasan | Peak Discharge Current |
| Siklus Hidup | Cycle Life |
| Tegangan Nominal PV Input | Rated PV Input Voltage |
| Arus Passthrough AC Kontinu Maksimum | Max. Continuous AC Passthrough Current |
| Unbalanced Load Support | Unbalanced Load Support |
| Unbalanced Load Output Capability | Unbalanced Load Output Capability |
| Mode Operasi Baterai | Battery Operating Mode |
| Komunikasi Antar Baterai | Inter-Battery Communication |
| Port Portabilitas | Portability Ports |
| Tipe Perangkat | Device Type |
| Rentang Tegangan Operasi | Operating Voltage Range |
| Rentang Tegangan Operasi DC | DC Operating Voltage Range |
| Rentang Tegangan Operasi Sistem | System Operating Voltage Range |
| Rentang Tegangan Operasi Modul | Module Operating Voltage Range |
| Kapasitas Seri Modul Baterai | Battery Module Series Capacity |
| Tampilan Antarmuka | Display Interface |
| Tipe Pengukuran | Measurement Type |
| Kapasitas Pengelolaan Perangkat | Device Management Capacity |
| Tegangan Suplai Input | Input Supply Voltage |
| Konsumsi Daya Maksimum | Maximum Power Consumption |
| Konsumsi Daya Sendiri / (Self-Consumption) | Self-Consumption |
| Konsumsi Daya Self-Power | Self-Power Consumption |
| Protokol Komunikasi | Communication Protocol |
| Konfigurasi Sistem | System Configuration |
| Port Tambahan | Additional Ports |
| Jumlah Terminal Baterai | Number of Battery Terminals |
| Daya maksimum (Pmax) | Maximum Power (Pmax) |
| Teknologi sel | Cell Technology |
| Teknologi sel baterai | Battery Cell Technology |
| Jumlah sel | Number of Cells |
| Tegangan daya maks (Vmp) | Maximum Power Voltage (Vmp) |
| Arus daya maks (Imp) | Maximum Power Current (Imp) |
| Tegangan sirkuit terbuka (Voc) | Open-Circuit Voltage (Voc) |
| Arus hubung singkat (Isc) | Short-Circuit Current (Isc) |
| Maksimum tegangan sistem | Maximum System Voltage |
| Koefisien suhu (Pmax) | Temperature Coefficient (Pmax) |
| Degradasi daya | Power Degradation |
| Bingkai (Frame) | Frame |
| Kabel & Konektor | Cables & Connectors |
| Ketahanan beban mekanis | Mechanical Load Resistance |
| Komunikasi Internal ke PDU atau Modul Lain | Internal Communication to PDU or Other Modules |
| Komunikasi Internal ke Modul Baterai | Internal Communication to Battery Modules |
| Komunikasi Internal (ke Modul Baterai/BMU) | Internal Communication (to Battery Modules/BMU) |
| Komunikasi Internal (ke Modul Baterai GB-L) | Internal Communication (to GB-L Battery Modules) |
| Komunikasi Internal Kluster | Cluster Internal Communication |
| Komunikasi Eksternal | External Communication |
| Komunikasi Eksternal / Monitoring | External Communication / Monitoring |
| Komunikasi Sistem ke Inverter | System-to-Inverter Communication |
| Koneksi Daya | Power Connection |
| Kapasitas energi yang dapat digunakan | Usable Energy Capacity |
| Daya keluaran continue | Continuous Output Power |
| Peak output | Peak Output Power |
| Interface Komunikasi RS485 | RS485 Communication Interface |
| Interface Digital Input / Output | Digital Input / Output Interface |
| Akurasi Pengukuran | Measurement Accuracy |
| Tegangan Operasi AC | AC Operating Voltage |
| Frekuensi Grid Nominal | Nominal Grid Frequency |
| Frekuensi Operasi | Operating Frequency |
| Tipe Sistem | System Type |
| Respon Kontrol | Control Response |
| Kaca Depan / Belakang | Front / Rear Glass |
| Kaca depan | Front Glass |
| Kelas Akurasi | Accuracy Class |
| Parameter Terukur | Measured Parameters |
| Port Komunikasi | Communication Ports |
| Protokol | Protocol |
| Alamat Modbus (Device ID) | Modbus Address (Device ID) |
| Modul Width | Module Width |
| Daya Masukan DC Maksimum | Max. DC Input Power |
| Jumlah Masukan Baterai | Number of Battery Inputs |
| Modul Seluler / Komunikasi | Cellular Module / Communication |
| Modul Seluler | Cellular Module |
| Frekuensi Seluler (EU Version) | Cellular Frequency (EU Version) |
| Fitur Kontrol & Manajemen | Control & Management Features |
| Fitur Kontrol | Control Features |
| Opsi Ekstensi | Expansion Options |
| Ketahanan PID & Anti-LID | PID & Anti-LID Resistance |
| Ketahanan PID | PID Resistance |
| Fitur Keselamatan Tambahan | Additional Safety Features |
| Dimensi per Modul Baterai (Tinggi x Lebar x Dalam) | Dimensions per Battery Module (H × W × D) |
| Berat per Modul Baterai | Weight per Battery Module |
| Arus Acuan (Base Current / Continuous) | Base Current / Continuous |
| Arus Acuan (Base Current) | Base Current |
| Arus Minimum / Starting Current | Minimum Current / Starting Current |
| Arus Maksimum ($I_{max}$) | Maximum Current ($I_{max}$) |
| Arus Maksimum (Direct/CT) | Maximum Current (Direct/CT) |
| Arus Maksimum (via CT) | Maximum Current (via CT) |
| Arus Maksimum | Maximum Current |
| Standar Wireless (WLAN) | Wireless Standard (WLAN) |
| Interface Optik (Fiber) | Optical Interface (Fiber) |
| Garansi Resmi | Official Warranty |
| Lebih Optimal | More Optimized |
| Komunikasi Fleksibel | Flexible Communication |
| Nominal voltage (per modul) | Nominal voltage (per module) |
| Operating voltage (sistem cluster high-voltage) | Operating voltage (high-voltage cluster system) |
| Api / Kebakaran | Fire |

Labels already in English (`IP Rating`, `Form Factor`, `Total Harmonic Distortion`, `Power Factor`,
`Depth of Discharge`, `Junction Box`, `Display`, `Peak output`, `Max. Efficiency`,
`Recommended Max. PV Power`, `Active Safety`, `Unbalanced Load Support`, `Baud Rate`,
`Interface Ethernet (LAN)`, …) are left exactly as written.

## 3. Term base — recurring inline phrases

| Indonesian | English |
| --- | --- |
| dan | and |
| atau | or |
| dengan | with |
| tanpa | without |
| untuk | for |
| dari | from |
| sampai / s/d | to |
| tambah (arithmetic) | + |
| kurang dari | less than |
| lebih dari | more than |
| maksimum / maksimal / maks. | maximum / max. |
| minimum / minimal / min. | minimum / min. |
| nominal | rated |
| kurang lebih / sekitar | approximately |
| derajat Celsius | degrees Celsius |
| persen | percent |
| Rentang … sampai … | Range … to … |
| Ada / Tersedia | Yes / Available |
| Tidak ada | No |
| Termasuk | Included |
| Tidak termasuk | Not included |
| Silahkan di informasikan pada Notes | Please specify in the Notes |
| Aman untuk penggunaan indoor maupun outdoor | Safe for both indoor and outdoor use |
| Derating di atas 45 derajat Celsius | Derating above 45 degrees Celsius |
| Auto-sensing | Auto-sensing |
| Cocok untuk | Suitable for |
| Ideal untuk | Ideal for |
| Dapat digunakan | Can be used |
| Memiliki | Has |
| Dilengkapi dengan | Equipped with |
| Berbahan | Made of |
| Terbuat dari | Made from |
| Tahan hingga | Resistant up to |
| Masa garansi | Warranty period |
| tahun | years |
| bulan | months |
| hari kerja | business days |

## 4. Style conventions

- Element/hardware labels use **Title Case**: `Weight`, `Cooling`, `Operating Temperature`.
- Sentences use sentence case, ending with a period when they are sentences.
- `×` (U+00D7) for dimension separators — never the letter `x`.
- Keep `kWh`, `kWp`, `Wp`, `VDC`, `VAC`, `Ah`, `mm`, `kg`, `dB`, `°C` as written.
- Preserve any markdown link, HTML tag, or LaTeX such as `$I_{max}$`.
- Do not add a trailing period to a bare label that the source left bare.
