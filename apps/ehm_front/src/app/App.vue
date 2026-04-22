<script setup lang="ts">
import { computed, ref } from 'vue';
import NavBar from '../components/NavBar.vue';
import { defineComponent } from 'vue';


type VehicleType = 'suv' | 'sedan' | 'deportivo' | 'pickup';

type Vehicle = {
  id: string;
  model: string;
  type: VehicleType;
  image: string;
  description: string;
};

type Brand = {
  name: string;
  image: string;
  vehicles: Vehicle[];
};

const brands: Brand[] = [
  {
    name: 'Mazda',
    image:
      'data:image/jpeg;base64,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',
    vehicles: [
      { id: 'mazda-1', model: 'CX-90', type: 'suv', image: 'https://www.mazdausa.com/siteassets/vehicles/2025/cx-90--cx-90-phev/06_btv/cx-90-inline/002_sprites/model-selector/my25-cx90-inline-turbo-s-premium-plus-artisan-red-ms.png?w=460', description: 'El Mazda CX-90 es un SUV de tres filas con un diseño elegante y tecnología avanzada, perfecto para familias.' },
      { id: 'mazda-2', model: '3', type: 'sedan', image: 'https://www.mazdausa.com/siteassets/vehicles/2025/mazda3-sedan/04_btv/002_sprites/model/my25-m3-sedan-turbo-premium-plus-polymental-gray-ms.png?w=460', description: 'El Mazda 3 es un sedán compacto con un manejo excepcional y un interior moderno.' },
      { id: 'mazda-3', model: 'MX-5', type: 'deportivo', image: 'https://www.mazdausa.com/siteassets/vehicles/2026/mx-5-st/04_btv/002_sprites/model-selector/grand-touring---aero-gray/my26-mx-5-st-gt-aerogray-animatedms.png?w=460', description: 'El Mazda MX-5 es un roadster deportivo icónico, conocido por su diversión de conducción pura.' },
      { id: 'mazda-4', model: 'CX-50', type: 'suv', image: 'https://www.mazdausa.com/siteassets/vehicles/2026/cx-50/04_btv/002_sprites/model-selector/new-12.18-premium-plus/my26-cx50-2-5-turbo-premiumplus-polymetalgray-animatedms.png?w=460', description: 'El Mazda CX-50 combina el estilo de un coupé con la versatilidad de un SUV.' },
      { id: 'mazda-5', model: 'CX-5', type: 'suv', image: 'https://www.mazdausa.com/siteassets/vehicles/2026/cx-5/04_btv/002_sprites/model-selector/trim---hero-color/my26-2-5-premiumplus-soulred-animatedms.png?w=460', description: 'El Mazda CX-5 es un SUV compacto con un diseño atractivo y características premium.' },
    ],
  },
  {
    name: 'Toyota',
    image:
      'https://www.toyota-global.com/pages/contents/showroom/emblem/passion/images/passion_img01.jpg',
    vehicles: [
      { id: 'toyota-1', model: 'RAV4', type: 'suv', image: 'https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/rav4/xse/4530/m22/36/3.png?fmt=png-alpha&wid=930&hei=328&qlt=90', description: 'El Toyota RAV4 es un SUV confiable y versátil, ideal para aventuras urbanas y off-road.' },
      { id: 'toyota-2', model: 'Corolla', type: 'sedan', image: 'https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/corolla/xse/1866/1k3/36/5.png?fmt=png-alpha&wid=930&hei=328&qlt=90', description: 'El Toyota Corolla es un sedán económico y eficiente, conocido por su durabilidad.' },
      { id: 'toyota-3', model: 'Corolla cros', type: 'suv', image: 'https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/corollacross/xle/6305/089/36/5.png?fmt=png-alpha&wid=930&hei=328&qlt=90', description: 'El Toyota Corolla Cross combina el estilo de un SUV con la eficiencia del Corolla.' },
      { id: 'toyota-4', model: 'Tacoma', type: 'pickup', image: 'https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/tacoma/trdpro/7598/m73/36/5.png?fmt=png-alpha&wid=930&hei=328&qlt=90', description: 'El Toyota Tacoma es una camioneta resistente, perfecta para trabajo y recreación.' },
      { id: 'toyota-5', model: 'Highlander', type: 'suv', image: 'https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/highlander/xse/6959/3t3/36/5.png?fmt=png-alpha&wid=930&hei=328&qlt=90', description: 'El Toyota Highlander es un SUV de tres filas, espacioso y cómodo para familias grandes.' },
    ],
  },
  {
    name: 'Audi',
    image:
      'https://di-uploads-pod3.dealerinspire.com/vindeversautohausofsylvania/uploads/2018/10/Audi-Logo-Banner.png',
    vehicles: [
      { id: 'audi-1', model: 'Q5', type: 'suv', image: 'https://mediaservice.audi.com/media/fast/v3_1vzloG1tIiBKdppzWfxH2wcIQ-YGBgqChgYGE4wMBfkpTMCWSlMnJm5iemp-kC-OH9aTmV-aUmxvpGBkZluoSk_IztUhB2olJGHIf5T2RFO-XMdnT8dZvTIfLl0w-d8IAMr0BzG6UCC-SyQ4GcAEhzrISTIhhoQMRHEZzJkZmBgrQAyIhlAgI-vtCinILEoMVcvJTWpNF1Qw4BIIMzu4hri6OkTDADkpjpi4wAAAA?width=320&mimetype=image%2Fwebp', description: 'El Audi Q5 es un SUV premium con un interior lujoso y tecnología de vanguardia.' },
      { id: 'audi-2', model: 'A8', type: 'sedan', image: 'https://mediaservice.audi.com/media/fast/H4sIAAAAAAAAAFvzloG1tIiBOTrayfuvpGh6-m1zJgaGigIGBgZGoDhTtNOaz-I_2DhCHsCEtzEwF-SlMwJZKUycmbmJ6an6QD4_I3taTmV-aUkxO0grj-Sp6if_xEQzPs2__3tFYHv-bCfzaQysIF1_gAQLP5Dg3wkkOEIZwCRIxg1EHAbxmQyYGRhYK4CMSAYQ4OMrLcopSCxKzNUrz0wpyRDUMCASCLO7uIY4evoEAwCR3O916QAAAA?width=320&mimetype=image%2Fwebp', description: 'El Audi A8 es un sedán ejecutivo con comodidad excepcional y características de lujo.' },
      { id: 'audi-3', model: 'E-tron GT', type: 'deportivo', image: 'https://mediaservice.audi.com/media/fast/H4sIAAAAAAAA_1vzloG1tIiBOTrayfuvpGh6-m1zJgaGigIGBgZGoDhTtNOaz-I_2DhCHsCEtzEwF-SlMwJZKUycmbmJ6an6QD4_I3taTmV-aUkxO0grz_uOLPvewi9aarlyj9bZ1UzNm_N0BwMrUBfjfCDBogUk-H4BCQ4PBjAJMi8TRJwE8ZksmBkYWCuAjEgGEODjKy3KKUgsSszVK89MKckQ1DAgEgizu7iGOHr6BAMAdaWMIukAAAA?width=320&mimetype=image%2Fwebp', description: 'El Audi E-tron GT es un gran turismo eléctrico con rendimiento deportivo y autonomía impresionante.' },
      { id: 'audi-4', model: 'Q8', type: 'suv', image: 'https://mediaservice.audi.com/media/fast/H4sIAAAAAAAAAFvzloG1tIiBOTrayfuvpGh6-m1zJgaGigIGBgZGoDhTtNOaz-I_2DhCHsCEtzEwF-SlMwJZKUycmbmJ6an6QD4_I3taTmV-aUkxO0grz_L0Lb1OBua6acVlp1_YP901pTGtmIEVqItRF0gwHwUSfA-ABMcOBjAJMi8URJSC-EzGzAwMrBVARiQDCPDxlRblFCQWJebqlWemlGQIahgQCYTZXVxDHD19ggHC0NfI6QAAAA?width=320&mimetype=image%2Fwebp', description: 'El Audi Q8 es un SUV coupé con un diseño aerodinámico y un interior espacioso.' },
      { id: 'audi-5', model: 'Q7', type: 'suv', image: 'https://mediaservice.audi.com/media/fast/H4sIAAAAAAAAAFvzloG1tIiBOTrayfuvpGh6-m1zJgaGigIGBgZGoDhTtNOaz-I_2DhCHsCEtzEwF-SlMwJZKUycmbmJ6an6QD4_I3taTmV-aUkxO0grD2OyqLTKt_wJhe_4iuV9t21dFR34mIEVqItRBUgwzwYSfF-ABMdRBjAJMi8DRFSC-EyWzAwMrBVARiQDCPDxlRblFCQWJebqlWemlGQIahgQCYTZXVxDHD19ggErcR9B6QAAAA?width=320&mimetype=image%2Fwebp', description: 'El Audi Q7 es un SUV de tres filas con capacidad para siete pasajeros y comodidad premium.' },
    ],
  },
  {
    name: 'Ford',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrvZJcFSuBzTHzbCAs5Yqj3MQMi8yF6_hlWw&s',
    vehicles: [
      { id: 'ford-1', model: 'Explorer', type: 'suv', image: 'https://www.ford.com/content/dam/vdm_ford/live/en_us/ford/nameplate/explorer/2026/collections/3-2/26my_frd_epr_actv_bse_rpro_nav_280x121.png/jcr:content/renditions/cq5dam.web.1280.1280.png', description: 'El Ford Explorer es un SUV familiar con espacio para hasta siete pasajeros y características modernas.' },
      { id: 'ford-2', model: 'Bronco raptor', type: 'suv', image: 'https://www.ford.com/content/dam/vdm_ford/live/en_us/ford/nameplate/bronco/2025/collections/3-2/25_frd_bro_rptr_4d_shgn_rpro_280x121.png/jcr:content/renditions/cq5dam.web.1280.1280.png', description: 'El Ford Bronco Raptor es un SUV off-road de alto rendimiento con suspensión elevada.' },
      { id: 'ford-3', model: 'Mustang GT', type: 'deportivo', image: 'https://www.ford.com/content/dam/vdm_ford/live/en_us/ford/nameplate/mustang/2026/collections/3-2/26_Mustang_GlobalNav_v2.png/jcr:content/renditions/cq5dam.web.1280.1280.png', description: 'El Ford Mustang GT es un muscle car icónico con un motor V8 potente.' },
      { id: 'ford-4', model: 'F-150 ', type: 'pickup', image: 'https://www.ford.com/content/dam/vdm_ford/live/en_us/ford/nameplate/f-150f-150/2026/collections/3-2/26_FRD_F150_XLT_RR.png/jcr:content/renditions/cq5dam.web.1280.1280.png', description: 'La Ford F-150 es una camioneta pickup líder en ventas, conocida por su durabilidad y capacidad de carga.' },
      { id: 'ford-5', model: 'Escape', type: 'suv', image: 'https://www.ford.com/content/dam/vdm_ford/live/en_us/ford/nameplate/escape/2026/collections/3-2/26_frd_esp_actv_oxwh_rpro_280x121.png/jcr:content/renditions/cq5dam.web.1280.1280.png', description: 'El Ford Escape es un SUV compacto con eficiencia de combustible y tecnología avanzada.' },
    ],
  },
  {
    name: 'Volkswagen',
    image:
      'https://logowik.com/content/uploads/images/345_volkswagen_logo.jpg',
    vehicles: [
      { id: 'vw-1', model: 'Tiguan', type: 'suv', image: 'https://media.vw.mediaservice.avp.tech/media/fast/v3_yWTb2gbdRzGf_t0W6drEnLX5kqTpeltuWlySdNrk3S6OLbJJuKk6KzomOGS3JLM5JJeL-k6YSgqKsMXU1Z0MlEQqTqdk00UQWUqQ4UJgrPgXvSNoMhQNxAZil4VHvj-4Xkevi-e76krYk3HEezbceqa8ufadXuXEeJQW4ieV8Qat-OUWquEEFPcWG-aVWv0YNuqKmp3LmV226Nuvdox7VEjY-RS__epbD6TKpe7RkD0ejLRI0Tvo175dGUQfn_HabRNx2ymK1apUw3eZOStTCUzYZTGs5MTk2bZKlWM8QPlTDY_bhmlbC6Ty1UquWxe8tQfi56K1RGBSq7ZOmB6NKdlu-2ykMvuWGni8Nh8a9bD4cyYB7F65SgR2OQ69WrVcopNp1hrG2jn2agSFoS_IXIzkd1Ef2Z4idgdxM4TWyb2G6pM3EZ7Eu0E2jkSGoltJKZIvEniI5L7SF0m3U9aRezFt5nAFMEvkI4g70c-Qv-9RJtEX2XkCvFl9CKp3xEbEDVCL6IIlEHCqwmfI3YUdTNqnqRN8if0g-jXSHXoG6HvNfxLSA8SugvlKMrXhI8z_BixMMm_0XX0bein8b2Lf57AcZT9RG4h-CPBywxcJ7SWUJbQJKEFQm-hjKNMo9goCwz9hTqDegb1KulF4g8QP0n8Q-IXSNxGokUSkiGSl9BfQl9E_x6xSOBxgmeQ-pHHkD9B_oOBs8TeQH0K9QLyE0RtYlcZhMHdDH3F0EUiESL3seE00TuJdtAiaHkSKfTrpBYQz7P-H_pepu8zfALfOnwP4fsW36_4XyDwNIFnCboETxJ8HWkV0lakQ0jHkN5Guoi8iLyE_CX9vzD8ASPPoF5i4w3E7yH-A1qaxC5CEsp6hvcwfIzYe-RuJXuW7PvktqKOkErjfw7_O_TuoncT0nfISfofYeBzQjNEZr3AnbDsbt0LWdOy3cL0_cWdO6eN4o5Wo6LN1SturTC2xchoNaterbmFLbmMZjbaNbPgOh1LK5tNyzEL26enjNuL24tGMZMxNNP2fsitt-zZwt0rIq3ZqlgNx-rWZ71lYc-UoVUbrZLZcMy5h635WWumY9llq2BoTcs1K6Zrdi3nP6oh93jW_wKy_t6WuwMAAA.webp?width=648', description: 'El Volkswagen Tiguan es un SUV compacto con un diseño moderno y características de seguridad avanzadas.' },
      { id: 'vw-2', model: 'Jetta', type: 'sedan', image: 'https://media.vw.mediaservice.avp.tech/media/fast/v3_x2TXWhbdRjG__7aWbs1CeecNme0MUnPlrOa5LTJiemXBum6K920OqmoaDxJTpPUfHlykujN2EDnB34MvVnHduVFVx0yhQpSGVNkYyhaFHUTwaHgzdjFGKLIBNNdvR-8v4fn4nnPXBfbWo7g6b1nbqr_3HnX41cR4sWGED3HxTa35eTqdwghFtherlpFe2K5YRfVcLtjWO3GxLLtutaEmTAnjdutkZyaM_L5tukTfV1I9AjRd7hbzm8NwuttOZWG5VjV8YKdaxWlsZRtplOp9ORkIZlMTqVt015KpRN5s2AmZ6bvzSeS01Y6ZxVycpc-L3paTUv4CpPV-pJlppaces1t5EVfrpU2naYperd8CN9u1ykXi7aTrTrZUiPJ2JvsmmXkOwIGgQOEdhOaJ3SZ8CzhLwn_gSajbRIpob-CfgL9LPo60buJPkB0gegHRDeIPYexyfh2xscQi3j24LORLiAfRimiHEK5yeBBgmWCq4xexriB0BB5Bjr4T6P2oA4x0svIOuFX0fagTRFrEe8lvkz8LwyXgXvwXkF6A_kp_PtR30b9k5GjhI4QDhH9lNhxYmeJXSWeIj5L_As8a6gJ1GcJzCJ9jfQb0q_IBkP_4u_Hn8I_jf9D1BTqI6h11PcYvsbwLUIWod_RamgfE3mSyDEip4isEfmMyEX0R4l27f1EfIX4GvEfEav4XkY6hyyjnEP5m6EVwu-jvY52EeUIwTrBC-yEnRbDnzP8A4EggccI_ELwQYId9AD6fUQNDIGxA-MddvzHwDEGNvAIPP149uH5Fs8NvJv4XsP3FtIhpFNIHyHdQr4fuYW8gryKvI58CeU0yvcolxi8RkAQ2mD0INoVdvUT2U_kJJGf0ceJPkT8On4F_zeEVgl_gjaKMY73Xbxd5WdQYgweZegr_B0CHgLNbtRO2LV2uRuvql1zM4tPZOfnF83s3nqloHfKBbeUSc6YCb1kl4slNzMzmdCtSqNkZVynZet5q2o7VmZuccHcl53LmtlEwtStWvd33HK91sw8vAXp1XrBrjh2u9zsLjMHFpJ6sVLPWRXH6jxvv9S0X2jZtbydMfWq7VoFy7XatnP71FR6utL_A4iXQEyzAwAA.webp?width=648', description: 'El Volkswagen Jetta es un sedán confiable y eficiente, ideal para el uso diario.' },
      { id: 'vw-3', model: 'Golf GTI', type: 'deportivo', image: 'https://media.vw.mediaservice.avp.tech/media/fast/v3_02TbWhbdRTG__vVrbo1ibnp7tU2puldczuSe9Pkpi-LGKWtzA1bqKxWnJRwk9wmmXnr7U1qNxiKQpUhIrKh4vykUkeZziHsi--r4hQFQTd8gYL4cagMhspAUz8NDpzzg_Mcng_PWb8qtjcdwWMT69eUv3bcOruJEE80hOh4R2x3m06uvk0IMcPOctUq2kNHGnZRCbWWDavVGCrWKwtDZsIcNbYmY6SUMPL5lukTnW2J6BCi88l2-3gLhNfbdCoNy7Gq8YKdaxb9exO5sX255Eg6ZeaGC_lUOpkYS40kE6mkbecLBTu9kB9eSKWGx6S2-kPRUbCbwlcYrdYXLDO14NRrbiMvPAUrmT56NLVSX2qXuGXLjPANuE65WLSdbNXJlhomg1UGztMr6P2WYJLgFKHr9E3Sd4XwAcKfEt4k_Aeqn0gNbRXtVbT3iWpE7yM6Q_QM0U-IPYpxkXg38THELJ5BfDP4N5COE5gncJzuQ4SqhN5E3UlkE30e40_EXsQyXS3kV1AEyh30BgmfQB1ENYnV0I-gX8Nw6eqn6w28V5AOI0-hnEC5QO8qfU8R7qVfJfYrsRvoOvph9A087-JdwXcSxUSZJ3g3_q_w_4b_Z-QdyCPI-5BfRF5HSaFMo9RQTtFzA3UR9RzxNSLzRE4TOUvkAyJfoD1E9F6idWIQk4n9iH4MfQ39F8QZfE_jP4fUTeAjAtfZfZrw26irqJ8TeIZQg9AGd_5DzyV6viEYJPgwd60RaqLtQRsjaqD_jXE7xinES-z6l67X6foMj8DzIJ7v8PyO92V8z-J7Hr-L_zX8byFtQ7oHaRnpFNI60nmkLwlcJnCJ7qv0XaD_OdQf2HMbkUNEfkKLE92PLCF_jeKhb53we4Qvo4Yw4nhfwHuWzv1I3xOI0X2M3ReRFwkuiV0D49MTB6cOPnBgNnkzmDdDqh3Ek3atVW6Hr2rX3MzcI9nJyTkzO1GvFLTlcsEtZZJpM6GV7HKx5GbSownNqjRKVsZ1mraWt6q2Y2XG52bM-7PjWTObSJiaVWv_lVuu15YyWrVesCuO3SovtTkzPWNqxUo9Z1Uca_lxe2XJXmzatbydMbWq7VoFy7VatvP_qhnoaF_9D1HwrhfKAwAA.webp?width=648' },
      { id: 'vw-4', model: 'Touareg', type: 'suv', image: 'https://media.vw.mediaservice.avp.tech/media/fast/v3_02TX2hbdRTHf_vUrqttE5K0uVuTJeltc9XkJk1v2qTT5qGtaOccFjbr6BjhJrlJ0-bfbm9S60QciqgoU8ZkGxNBBk42B7KH7UHYH0VwD4IoKnNCxSenK2pBfBjinfgw-MLhA-cczuF8z7nbor1pCvZPnduQ_t68Ze8aQjzbEKLtJ9FuNc1cfZMQYpb7y1W9ZAwvNoySFGqtxPRWY9iqN3XTKA1rCS0V-x9i-XxLc4oOu0i0CdHxoh2u3AXhcDTNSkM39Wq8YOSaJdeDyUIxMZ5KpAvaaCE9UizkRkdzqbSRLo6M5VLj44WRsdF0ciwx5rarr4u2gtEUzkKqWi_qWrJo1mtWIy-2mflx87nFZKNo2Fqtm7Z0vWloVXHf3bmEc8gyy6WSYWarZnahoaFcY_A6vpv4dxFYJzhDyNY1QmuEfif8COEllMMoJ1EuoFwi4iMySeQ0kRtE54ndIO4kvhWxD-cszkO4PsNzAM8L9O4hUEFuRz6KfAJ1CNUgdgsxQfcq3iW8x5G24nsI34eE3kJ-ADmNXCJaQ11EPYu6Qcyie4Du0ziu4vgW1-u45-nbwLsd7x6k55F-w6cTOEbgOMFXCK4TChCZI7qGmkTdh3qRno9wrOJ8D-kArl9w3cTtxz2IdzPeMbzjeC8iJZF2IdWQmkjv0L9O_x2CPyMfRL5F_Azh_YTfJvwu4ctEMkS3EPmRqEQ0RvQr1MOoZ1C_Q7UXPIvzYZwv4foYtwfPKJ4reP6ir5_Q-8ivIn-O52UCDdpOEfoT6R-2ddF_lf4v8fvxP812F4GnCDRRBlAyRGLEBLFTthcRR-i6Q_en9Ah6Juj5hp4_cEzhOIHzDZxv4rJwfYB7E-4J3E_gPon7Ezxf03uZ3l8JXmLAx8BryN8z2Ek4Tnia8A8onShxIo-h3sbrJmhf5ALyALE4jiM4ztMxgydK7yH6vsBbx9-JX8M_j3-Z0HnRNTS5e2rnkzsfn9k7ci9o90LSNu4xo9Yq22atGjUrM_dMdnp6TstO1SsFZaVcsBYyIzu0hLJglEsLVmZHKqHolcaCnrHMpqHk9aph6pnJuVnt0exkVssmEpqi1-xPtMr12nJGqdYLRsU0WuVlmzO7ZzWlVKnn9IqprywZq8vGwaZRyxsZTakall7QLb1lmP-lap42u-u_kxD06fwDAAA.webp?width=648', description: 'El Volkswagen Touareg es un SUV de lujo con capacidades off-road y un interior premium.' },
      { id: 'vw-5', model: 'Taos', type: 'suv', image: 'https://media.vw.mediaservice.avp.tech/media/fast/v3_yWTW4gbdRTG__3ttlvsZkMm24zuxiQ7NVM7mckmk2azAYO2K1UKatC69cI2TpLZJJrbTiZZlyKsD97woSja0mIfxAqRFqGIKFJRK1KsUkFRCoL0pS_VIiqID95mFQ6cC-f7zvfwnTPXxea-I3h075nf5D-2bD1wBSGe7AoxsiY2u32n3NkkhChyQ6Nl1ezZx7t2TVYGq4Y16M66FafT682aKTNn_F8bZq1iVCoD0y_GPJgYEWJs3UsfbzRiYqLvNLuWY7WSVbvcrwVuLZvVzHLWmp-3UhmzMp_OZ3eXc5Xy7lzWzubzlpnNVXOV3Fxe8tDviJGq3Rf-6lyrs2yZmWWn03a7FeGrZtKmNTDXOj0vxOiGHOG_xXUatZrtlFpOqd5Ns7PBDpfprwjvInwXkZ-ILhC9TOxuYueJXUEJEF9GPYx6Ak1Fux2tiHYK7RsSj2F8gPE3SQ1xAN9O_EUCnyOtE1xi8gEidSKvo2xCX8L4BRFD9AkdJ_QW8hjyjUyPMv0usRdRdqHkSHRInEMfRf8Vo8_4DOOnmPgE6RFCB5GfQn6T6fsJ30TkGNFniDrEwmiH0d4jcZbEVXQdfRH9LD7vRAp5CfkhwjkCXxC4SuAHQlsIZQkdJXQaOYN8H_IrTP2JsoJyjeSQ-MPETxI_Tfx94hfQPFXfoR9HH6J_iX4NMcS_jiQR_Ijg72wvEjpC7A2U51AuEHyaSJfIZ8h_MVVi6hxTlwiHCT_IzTki-4n0UXeg3oFmYAiMbRhH2fYP45_iE_i24juE7xK-n_E_j_9lAusEThIYIoF0G9KrSOcJDgl-TfAikz8S_ZCZF1AuE18g_hrx71GTaPvQr5PcT0hC9hF9CWUGI8nEESbeJnCIsX1I3xJMMPks2y8SWvGcdMJuDxqee1p22y0sHiwtLCyapb2dZlVdbVTdeiGdN1Nq3W7U6m4hP5dSrWa3bhVcp2-rFatlO1Zhz2LRvLO0p2SWUilTtdrec7iNTrtXuHcDpLY6Vbvp2INGzxsW7imm1VqzU7aajrX6hL3Ws1f6drtiF0y1ZbtW1XKtge38t2oGRzzqfwHxBTfylAMAAA.webp?width=648', description: 'El Volkswagen Taos es un SUV subcompacto con un diseño fresco y características modernas.' },
    ],
  },
];

const openChatbot = () => {
  window.alert('Chatbot coming soon. Contact us on WhatsApp: +57 300 123 4567');
};

const selectedBrand = ref<Brand>(brands[0]);
const showBrandVehicles = ref(false);
const showModal = ref(false);
const selectedVehicle = ref<Vehicle | null>(null);

const selectBrand = (brand: Brand) => {
  selectedBrand.value = brand;
  showBrandVehicles.value = true;
};

const vehiclesByBrand = computed(() => selectedBrand.value.vehicles);

const runBrandAction = (action: string, vehicle: Vehicle) => {
  if (action === 'Ver detalle') {
    selectedVehicle.value = vehicle;
    showModal.value = true;
  } else {
    window.alert(`${action} - ${selectedBrand.value.name} ${vehicle.model}`);
  }
};

const viewInventory = () => {
  window.alert(`Inventario de ${selectedBrand.value.name}`);
};

const scheduleTestDrive = () => {
  window.alert(`Test drive para ${selectedBrand.value.name}`);
};

const requestFinancing = () => {
  window.alert(`Financiacion de ${selectedBrand.value.name}`);
};

const toTitleCase = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const closeModal = () => {
  showModal.value = false;
  selectedVehicle.value = null;
};

const highlightsSection = ref<HTMLElement>();

const scrollLeft = () => {
  const el = highlightsSection.value;
  if (el) {
    if (el.scrollLeft === 0) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: -520, behavior: 'smooth' });
    }
  }
};

const scrollRight = () => {
  const el = highlightsSection.value;
  if (el) {
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: 520, behavior: 'smooth' });
    }
  }
};

const highlights = [
  {
    title: 'Asesoria personalizada',
    description: 'Te ayudamos a elegir el vehiculo ideal segun tu presupuesto y estilo de vida.',
    image:
      'https://asepyme.com/wp-content/uploads/2023/07/que-es-una-asesoria-contable.png',
  },
  {
    title: 'Test drive inmediato',
    description: 'Agenda pruebas de manejo de forma rapida y compara varias marcas en un solo lugar.',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAwVE30iEaraD4zhb6Nlyt3FDoQMUWInH4Vg&s',
  },
  {
    title: 'Financiacion flexible',
    description: 'Opciones de credito y cuotas adaptadas para que estrenes auto sin complicaciones.',
    image:
      'https://www.monet.com.co/wp-content/uploads/2025/01/impacto-creditos-flexibles.jpg',
  },
];
</script>

<template>
  <div class="page-shell">
    <NavBar @go-home="goToHomeMenu" />

    <main class="catalog-page">
      <section class="hero">
        <p class="hero-kicker">Concesionario premium</p>
        <h1>Encuentra tu proximo auto ideal</h1>
        <p class="hero-subtitle">
          Explora nuestro catalogo con diseño deportivo, tecnologia de punta y
          las mejores marcas del mercado.
        </p>
      </section>

      <section class="brand-switcher" aria-label="Selector de marcas">
        <button
          v-for="brand in brands"
          :key="brand.name"
          type="button"
          class="brand-switcher-button"
          :class="{ active: selectedBrand.name === brand.name }"
          :aria-pressed="selectedBrand.name === brand.name"
          @click="selectBrand(brand)"
        >
          <img :src="brand.image" :alt="`Logo ${brand.name}`" class="brand-switcher-logo" />
          <span>{{ brand.name }}</span>
        </button>
      </section>

      <div class="highlights-container" v-if="!showBrandVehicles">
        <button class="carousel-arrow left" @click="scrollLeft" aria-label="Previous highlights">&lt;</button>
        <section ref="highlightsSection" class="highlights-section" aria-label="Beneficios del concesionario">
          <article v-for="item in highlights" :key="item.title" class="highlight-card">
            <div class="highlight-image-container">
              <img :src="item.image" :alt="item.title" class="highlight-image" />
            </div>
            <div class="highlight-content">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
          </article>
        </section>
        <button class="carousel-arrow right" @click="scrollRight" aria-label="Next highlights">&gt;</button>
      </div>

      <section v-if="showBrandVehicles" class="catalog-grid">
        <button
          v-for="vehicle in vehiclesByBrand"
          :key="vehicle.id"
          class="car-card"
          type="button"
          :aria-label="`Seleccionar ${selectedBrand.name} ${vehicle.model}`"
          @click="runBrandAction('Ver detalle', vehicle)"
        >
          <div class="image-wrapper">
            <img
              :src="vehicle.image"
              :alt="`${selectedBrand.name} ${vehicle.model}`"
              class="car-image"
            />
          </div>
          <div class="car-content">
            <h2>{{ selectedBrand.name }}</h2>
            <p>{{ vehicle.model }}</p>
            <span class="car-tag">{{ toTitleCase(vehicle.type) }}</span>
          </div>
        </button>
      </section>

      <section v-if="showBrandVehicles" class="brand-menu" aria-live="polite">
        <div class="brand-menu-header">
          <h2>{{ selectedBrand.name }}</h2>
          <img :src="selectedBrand.image" :alt="selectedBrand.name" class="brand-logo" />
        </div>
        <p>Selecciona un vehiculo de {{ selectedBrand.name }} para ver su detalle rapido.</p>
        <div class="brand-menu-actions">
          <button type="button" @click="viewInventory">
            Ver inventario
          </button>
          <button type="button" @click="scheduleTestDrive">
            Agendar test drive
          </button>
          <button type="button" @click="requestFinancing">
            Solicitar financiacion
          </button>
        </div>
      </section>
    </main>
  </div>

  <!-- Modal -->
  <div v-if="showModal" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="modal-close" @click="closeModal">&times;</button>
      <div v-if="selectedVehicle" class="modal-body">
        <img :src="selectedVehicle.image" :alt="`${selectedBrand.name} ${selectedVehicle.model}`" class="modal-image" />
        <h2>{{ selectedBrand.name }} {{ selectedVehicle.model }}</h2>
        <p>{{ selectedVehicle.description }}</p>
      </div>
    </div>
  </div>

  <footer class="footer">
    <div class="footer-content">
      <h3>Contacto del Concesionario</h3>
      <p>Direccion: Av. Principal 123, Bogota, Colombia</p>
      <p>Telefono: +57 3173250884</p>
      <p>Email: contacto@carsales.com</p>
      <p>Horario: Lun - Sab, 8:00 AM - 6:00 PM</p>
    </div>
  </footer>

  <button class="chatbot-button" type="button" @click="openChatbot">
    Chatbot
  </button>
</template>

<style scoped>
.page-shell {
  min-height: 100vh;
  background: radial-gradient(circle at top right, #dce9ff 0%, transparent 38%),
    radial-gradient(circle at 10% 20%, #ffe6e0 0%, transparent 35%),
    linear-gradient(180deg, #f7f9ff 0%, #f3f6ff 45%, #eef1ff 100%);
}

.catalog-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 2rem 3.5rem;
}

.hero {
  text-align: center;
  margin-bottom: 2.25rem;
  padding: 2rem 1.25rem;
  min-height: 38vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(6px);
  box-shadow: 0 14px 40px rgba(42, 53, 89, 0.12);
}

.hero h1 {
  font-size: clamp(2rem, 3vw, 2.8rem);
  color: #1d2440;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.hero-kicker {
  display: inline-block;
  margin-bottom: 0.8rem;
  background: linear-gradient(135deg, #ff7676, #ff9f6e);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
}

.hero-subtitle {
  color: #4d5577;
  margin: 1rem auto 0;
  max-width: 700px;
  font-size: 1.05rem;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1.3rem;
}

.brand-switcher {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.brand-switcher-button {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.7rem;
  min-width: 230px;
  min-height: 82px;
  border: 1px solid #dce3ff;
  border-radius: 18px;
  background: #ffffff;
  color: #30406a;
  font-weight: 700;
  font-size: 1.02rem;
  padding: 0.95rem 1.1rem;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(24, 38, 76, 0.1);
  transition: all 0.2s ease, box-shadow 0.2s ease;
}

.brand-switcher-button:hover {
  transform: translateY(-2px);
  border-color: #b8c7ff;
  box-shadow: 0 14px 28px rgba(24, 38, 76, 0.15);
}

.brand-switcher-button.active {
  border-color: transparent;
  background: linear-gradient(135deg, #ff6f7a, #ff9b67);
  color: #fff;
  box-shadow: 0 14px 30px rgba(241, 93, 84, 0.34);
}

.brand-switcher-logo {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  object-fit: cover;
  background: #fff;
  padding: 4px;
}

.brand-switcher-button span {
  letter-spacing: 0.01em;
}

.highlights-section {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-bottom: 1.4rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 0 2rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.highlights-section::-webkit-scrollbar {
  display: none;
}

.highlights-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e7ebff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  color: #30406a;
  box-shadow: 0 4px 12px rgba(24, 38, 76, 0.15);
  transition: all 0.2s ease;
  z-index: 10;
}

.carousel-arrow:hover {
  background: #ffffff;
  box-shadow: 0 6px 16px rgba(24, 38, 76, 0.2);
  transform: translateY(-50%) scale(1.1);
}

.carousel-arrow.left {
  left: -60px;
}

.carousel-arrow.right {
  right: -60px;
}

.highlight-card {
  overflow: hidden;
  border-radius: 18px;
  background: #fff;
  border: 1px solid #e7ebff;
  box-shadow: 0 12px 26px rgba(24, 38, 76, 0.12);
  min-height: 50vh;
  width: 500px;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  scroll-snap-align: start;
}

.highlight-image {
  width: 80%;
  height: auto;
  object-fit: cover;
}

.highlight-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.highlight-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.highlight-content h3 {
  color: #1f2a4a;
  font-size: clamp(1.5rem, 3vw, 2.2rem);
}

.highlight-content p {
  margin-top: 0.75rem;
  color: #576285;
  line-height: 1.6;
  font-size: 1.05rem;
}

.car-card {
  text-align: left;
  width: 100%;
  font: inherit;
  color: inherit;
  cursor: pointer;
  background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e7ebff;
  box-shadow: 0 12px 30px rgba(24, 38, 76, 0.12);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.car-card:hover {
  transform: translateY(-7px);
  box-shadow: 0 16px 38px rgba(24, 38, 76, 0.2);
}

.car-card:focus-visible {
  outline: 3px solid #ff8b54;
  outline-offset: 2px;
}

.image-wrapper {
  overflow: hidden;
}

.car-image {
  width: 100%;
  height: 170px;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.car-card:hover .car-image {
  transform: scale(1.06);
}

.car-content {
  padding: 1rem 1rem 1.1rem;
}

.car-content h2 {
  font-size: 1.1rem;
  color: #1f2a4a;
}

.car-content p {
  color: #566086;
  margin-top: 0.35rem;
}

.car-tag {
  display: inline-block;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #0e7a4b;
  background-color: #d9f7e8;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
}

.brand-menu {
  margin-top: 1.5rem;
  padding: 1.2rem;
  border-radius: 14px;
  border: 1px solid #dfe6ff;
  background: #ffffffde;
  box-shadow: 0 12px 30px rgba(24, 38, 76, 0.1);
}

.brand-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand-logo {
  width: 120px;
  max-height: 42px;
  object-fit: contain;
}

.brand-menu-header h2 {
  color: #1f2a4a;
}

.brand-menu p {
  margin-top: 0.4rem;
  color: #576285;
}

.brand-menu-actions {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.brand-menu-actions button,
.brand-menu-close {
  border: none;
  border-radius: 999px;
  padding: 0.5rem 0.85rem;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(135deg, #ff6f7a, #ff9b67);
  color: #fff;
}

.brand-menu-actions button:hover,
.brand-menu-close:hover {
  filter: brightness(1.05);
}

.brand-menu-actions button:focus-visible,
.brand-menu-close:focus-visible {
  outline: 3px solid #ff8b54;
  outline-offset: 2px;
}

.footer {
  margin-top: 1rem;
  background: linear-gradient(135deg, #1f2433 0%, #222c44 60%, #243356 100%);
  color: #fff;
  padding: 2.4rem 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 0.3rem;
}

.footer-content h3 {
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
}

.footer-content p {
  margin: 0.3rem 0;
  color: #dce4ff;
}

.chatbot-button {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  background: linear-gradient(135deg, #ff5f6d, #ff8b54);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0.78rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 26px rgba(241, 93, 84, 0.5);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.chatbot-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(241, 93, 84, 0.55);
}

@media (max-width: 768px) {
  .catalog-page {
    padding: 1.6rem 1rem 2.5rem;
  }

  .hero {
    padding: 1.5rem 1rem;
    min-height: 72vh;
  }

  .highlight-card {
    min-height: 86vh;
    grid-template-columns: 1fr;
  }

  .highlight-image {
    height: 48vh;
  }

  .highlight-content {
    padding: 1.2rem 1rem 1.4rem;
  }

  .footer {
    padding: 2rem 1rem;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 18px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 14px 40px rgba(42, 53, 89, 0.3);
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  text-align: center;
}

.modal-image {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.modal-body h2 {
  margin-bottom: 1rem;
  color: #30406a;
}

.modal-body p {
  color: #666;
  line-height: 1.6;
}
</style>
