export type DistrictOption = {
  name: string;
};

export type CityOption = {
  name: string;
  districts: DistrictOption[];
};

export type ProvinceOption = {
  name: string;
  cities: CityOption[];
};

export const indonesiaRegions: ProvinceOption[] = [
  {
    name: "Aceh",
    cities: [
      {
        name: "Kota Banda Aceh",
        districts: [{ name: "Baiturrahman" }, { name: "Kuta Alam" }, { name: "Syiah Kuala" }]
      },
      {
        name: "Kab. Aceh Besar",
        districts: [{ name: "Darul Imarah" }, { name: "Ingin Jaya" }, { name: "Kuta Baro" }]
      }
    ]
  },
  {
    name: "Sumatera Utara",
    cities: [
      {
        name: "Kota Medan",
        districts: [{ name: "Medan Johor" }, { name: "Medan Baru" }, { name: "Medan Sunggal" }]
      },
      {
        name: "Kota Binjai",
        districts: [{ name: "Binjai Kota" }, { name: "Binjai Timur" }, { name: "Binjai Barat" }]
      }
    ]
  },
  {
    name: "Sumatera Barat",
    cities: [
      {
        name: "Kota Padang",
        districts: [{ name: "Kuranji" }, { name: "Padang Barat" }, { name: "Lubuk Begalung" }]
      },
      {
        name: "Kota Bukittinggi",
        districts: [{ name: "Guguk Panjang" }, { name: "Aur Birugo Tigo Baleh" }]
      }
    ]
  },
  {
    name: "Riau",
    cities: [
      {
        name: "Kota Pekanbaru",
        districts: [{ name: "Marpoyan Damai" }, { name: "Tampan" }, { name: "Payung Sekaki" }]
      },
      {
        name: "Kab. Kampar",
        districts: [{ name: "Bangkinang Kota" }, { name: "Siak Hulu" }, { name: "Tambang" }]
      }
    ]
  },
  {
    name: "Kepulauan Riau",
    cities: [
      {
        name: "Kota Batam",
        districts: [{ name: "Batam Kota" }, { name: "Sekupang" }, { name: "Batu Aji" }]
      },
      {
        name: "Kota Tanjungpinang",
        districts: [{ name: "Bukit Bestari" }, { name: "Tanjungpinang Timur" }]
      }
    ]
  },
  {
    name: "Jambi",
    cities: [
      {
        name: "Kota Jambi",
        districts: [{ name: "Jambi Selatan" }, { name: "Kota Baru" }, { name: "Pasar Jambi" }]
      },
      {
        name: "Kab. Muaro Jambi",
        districts: [{ name: "Jambi Luar Kota" }, { name: "Sekernan" }]
      }
    ]
  },
  {
    name: "Sumatera Selatan",
    cities: [
      {
        name: "Kota Palembang",
        districts: [{ name: "Ilir Barat I" }, { name: "Sukarami" }, { name: "Kalidoni" }]
      },
      {
        name: "Kab. Banyuasin",
        districts: [{ name: "Talang Kelapa" }, { name: "Betung" }]
      }
    ]
  },
  {
    name: "Bangka Belitung",
    cities: [
      {
        name: "Kota Pangkalpinang",
        districts: [{ name: "Girimaya" }, { name: "Taman Sari" }, { name: "Rangkui" }]
      },
      {
        name: "Kab. Bangka",
        districts: [{ name: "Sungailiat" }, { name: "Merawang" }]
      }
    ]
  },
  {
    name: "Bengkulu",
    cities: [
      {
        name: "Kota Bengkulu",
        districts: [{ name: "Gading Cempaka" }, { name: "Ratu Agung" }, { name: "Selebar" }]
      }
    ]
  },
  {
    name: "Lampung",
    cities: [
      {
        name: "Kota Bandar Lampung",
        districts: [{ name: "Sukarame" }, { name: "Rajabasa" }, { name: "Kemiling" }]
      },
      {
        name: "Kota Metro",
        districts: [{ name: "Metro Pusat" }, { name: "Metro Timur" }]
      }
    ]
  },
  {
    name: "Banten",
    cities: [
      {
        name: "Kota Serang",
        districts: [{ name: "Walangtaka" }, { name: "Curug" }, { name: "Taktakan" }]
      },
      {
        name: "Kab. Serang",
        districts: [{ name: "Ciruas" }, { name: "Cikande" }, { name: "Kramatwatu" }]
      },
      {
        name: "Kota Cilegon",
        districts: [{ name: "Cibeber" }, { name: "Ciwandan" }, { name: "Jombang" }]
      },
      {
        name: "Kota Tangerang",
        districts: [{ name: "Cipondoh" }, { name: "Karawaci" }, { name: "Ciledug" }]
      },
      {
        name: "Kota Tangerang Selatan",
        districts: [{ name: "Pamulang" }, { name: "Serpong" }, { name: "Ciputat" }]
      },
      {
        name: "Kab. Tangerang",
        districts: [{ name: "Kelapa Dua" }, { name: "Curug" }, { name: "Balaraja" }]
      },
      {
        name: "Kab. Lebak",
        districts: [{ name: "Rangkasbitung" }, { name: "Cibadak" }]
      },
      {
        name: "Kab. Pandeglang",
        districts: [{ name: "Pandeglang" }, { name: "Labuan" }]
      }
    ]
  },
  {
    name: "DKI Jakarta",
    cities: [
      {
        name: "Kota Jakarta Selatan",
        districts: [{ name: "Kebayoran Baru" }, { name: "Tebet" }, { name: "Pasar Minggu" }]
      },
      {
        name: "Kota Jakarta Barat",
        districts: [{ name: "Kebon Jeruk" }, { name: "Kembangan" }, { name: "Palmerah" }]
      },
      {
        name: "Kota Jakarta Timur",
        districts: [{ name: "Duren Sawit" }, { name: "Jatinegara" }, { name: "Cakung" }]
      },
      {
        name: "Kota Jakarta Utara",
        districts: [{ name: "Kelapa Gading" }, { name: "Penjaringan" }, { name: "Koja" }]
      },
      {
        name: "Kota Jakarta Pusat",
        districts: [{ name: "Menteng" }, { name: "Tanah Abang" }, { name: "Kemayoran" }]
      }
    ]
  },
  {
    name: "Jawa Barat",
    cities: [
      {
        name: "Kota Bandung",
        districts: [{ name: "Coblong" }, { name: "Lengkong" }, { name: "Sukajadi" }]
      },
      {
        name: "Kab. Bandung",
        districts: [{ name: "Bojongsoang" }, { name: "Soreang" }, { name: "Dayeuhkolot" }]
      },
      {
        name: "Kota Bekasi",
        districts: [{ name: "Bekasi Selatan" }, { name: "Bekasi Timur" }, { name: "Rawalumbu" }]
      },
      {
        name: "Kab. Bekasi",
        districts: [{ name: "Cikarang Utara" }, { name: "Tambun Selatan" }, { name: "Cibitung" }]
      },
      {
        name: "Kota Bogor",
        districts: [{ name: "Bogor Barat" }, { name: "Bogor Selatan" }, { name: "Tanah Sareal" }]
      }
    ]
  },
  {
    name: "Jawa Tengah",
    cities: [
      {
        name: "Kota Semarang",
        districts: [{ name: "Banyumanik" }, { name: "Tembalang" }, { name: "Candisari" }]
      },
      {
        name: "Kota Surakarta",
        districts: [{ name: "Banjarsari" }, { name: "Jebres" }, { name: "Laweyan" }]
      },
      {
        name: "Kab. Semarang",
        districts: [{ name: "Ungaran Barat" }, { name: "Bawen" }, { name: "Ambarawa" }]
      }
    ]
  },
  {
    name: "DI Yogyakarta",
    cities: [
      {
        name: "Kota Yogyakarta",
        districts: [{ name: "Gondokusuman" }, { name: "Mergangsan" }, { name: "Umbulharjo" }]
      },
      {
        name: "Kab. Sleman",
        districts: [{ name: "Depok" }, { name: "Ngaglik" }, { name: "Mlati" }]
      },
      {
        name: "Kab. Bantul",
        districts: [{ name: "Banguntapan" }, { name: "Kasihan" }, { name: "Sewon" }]
      }
    ]
  },
  {
    name: "Jawa Timur",
    cities: [
      {
        name: "Kota Surabaya",
        districts: [{ name: "Tegalsari" }, { name: "Wonokromo" }, { name: "Rungkut" }]
      },
      {
        name: "Kota Malang",
        districts: [{ name: "Klojen" }, { name: "Lowokwaru" }, { name: "Blimbing" }]
      },
      {
        name: "Kab. Sidoarjo",
        districts: [{ name: "Sidoarjo" }, { name: "Candi" }, { name: "Waru" }]
      }
    ]
  },
  {
    name: "Bali",
    cities: [
      {
        name: "Kota Denpasar",
        districts: [{ name: "Denpasar Barat" }, { name: "Denpasar Selatan" }, { name: "Denpasar Utara" }]
      },
      {
        name: "Kab. Badung",
        districts: [{ name: "Kuta" }, { name: "Kuta Utara" }, { name: "Mengwi" }]
      }
    ]
  },
  {
    name: "Nusa Tenggara Barat",
    cities: [
      {
        name: "Kota Mataram",
        districts: [{ name: "Ampenan" }, { name: "Mataram" }, { name: "Selaparang" }]
      }
    ]
  },
  {
    name: "Nusa Tenggara Timur",
    cities: [
      {
        name: "Kota Kupang",
        districts: [{ name: "Oebobo" }, { name: "Kelapa Lima" }, { name: "Alak" }]
      }
    ]
  },
  {
    name: "Kalimantan Barat",
    cities: [
      {
        name: "Kota Pontianak",
        districts: [{ name: "Pontianak Kota" }, { name: "Pontianak Selatan" }, { name: "Pontianak Timur" }]
      }
    ]
  },
  {
    name: "Kalimantan Tengah",
    cities: [
      {
        name: "Kota Palangka Raya",
        districts: [{ name: "Jekan Raya" }, { name: "Pahandut" }]
      }
    ]
  },
  {
    name: "Kalimantan Selatan",
    cities: [
      {
        name: "Kota Banjarmasin",
        districts: [{ name: "Banjarmasin Selatan" }, { name: "Banjarmasin Timur" }, { name: "Banjarmasin Utara" }]
      }
    ]
  },
  {
    name: "Kalimantan Timur",
    cities: [
      {
        name: "Kota Balikpapan",
        districts: [{ name: "Balikpapan Selatan" }, { name: "Balikpapan Utara" }, { name: "Balikpapan Kota" }]
      },
      {
        name: "Kota Samarinda",
        districts: [{ name: "Samarinda Ulu" }, { name: "Samarinda Ilir" }, { name: "Sungai Kunjang" }]
      }
    ]
  },
  {
    name: "Kalimantan Utara",
    cities: [
      {
        name: "Kota Tarakan",
        districts: [{ name: "Tarakan Barat" }, { name: "Tarakan Tengah" }, { name: "Tarakan Timur" }]
      }
    ]
  },
  {
    name: "Sulawesi Utara",
    cities: [
      {
        name: "Kota Manado",
        districts: [{ name: "Mapanget" }, { name: "Sario" }, { name: "Tuminting" }]
      }
    ]
  },
  {
    name: "Gorontalo",
    cities: [
      {
        name: "Kota Gorontalo",
        districts: [{ name: "Kota Selatan" }, { name: "Dungingi" }, { name: "Sipatana" }]
      }
    ]
  },
  {
    name: "Sulawesi Tengah",
    cities: [
      {
        name: "Kota Palu",
        districts: [{ name: "Palu Barat" }, { name: "Mantikulore" }, { name: "Tatanga" }]
      }
    ]
  },
  {
    name: "Sulawesi Barat",
    cities: [
      {
        name: "Kab. Mamuju",
        districts: [{ name: "Mamuju" }, { name: "Kalukku" }]
      }
    ]
  },
  {
    name: "Sulawesi Selatan",
    cities: [
      {
        name: "Kota Makassar",
        districts: [{ name: "Rappocini" }, { name: "Panakkukang" }, { name: "Tamalate" }]
      },
      {
        name: "Kab. Gowa",
        districts: [{ name: "Somba Opu" }, { name: "Pallangga" }]
      }
    ]
  },
  {
    name: "Sulawesi Tenggara",
    cities: [
      {
        name: "Kota Kendari",
        districts: [{ name: "Kadia" }, { name: "Poasia" }, { name: "Baruga" }]
      }
    ]
  },
  {
    name: "Maluku",
    cities: [
      {
        name: "Kota Ambon",
        districts: [{ name: "Sirimau" }, { name: "Baguala" }, { name: "Teluk Ambon" }]
      }
    ]
  },
  {
    name: "Maluku Utara",
    cities: [
      {
        name: "Kota Ternate",
        districts: [{ name: "Ternate Selatan" }, { name: "Ternate Utara" }, { name: "Pulau Ternate" }]
      }
    ]
  },
  {
    name: "Papua",
    cities: [
      {
        name: "Kota Jayapura",
        districts: [{ name: "Abepura" }, { name: "Heram" }, { name: "Jayapura Selatan" }]
      }
    ]
  },
  {
    name: "Papua Barat",
    cities: [
      {
        name: "Kab. Manokwari",
        districts: [{ name: "Manokwari Barat" }, { name: "Manokwari Timur" }]
      }
    ]
  },
  {
    name: "Papua Selatan",
    cities: [
      {
        name: "Kab. Merauke",
        districts: [{ name: "Merauke" }, { name: "Semangga" }]
      }
    ]
  },
  {
    name: "Papua Tengah",
    cities: [
      {
        name: "Kab. Mimika",
        districts: [{ name: "Mimika Baru" }, { name: "Kuala Kencana" }]
      }
    ]
  },
  {
    name: "Papua Pegunungan",
    cities: [
      {
        name: "Kab. Jayawijaya",
        districts: [{ name: "Wamena" }, { name: "Hubikosi" }]
      }
    ]
  },
  {
    name: "Papua Barat Daya",
    cities: [
      {
        name: "Kota Sorong",
        districts: [{ name: "Sorong Barat" }, { name: "Sorong Timur" }, { name: "Sorong Utara" }]
      }
    ]
  }
];
