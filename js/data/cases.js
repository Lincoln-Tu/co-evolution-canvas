/**
 * 真实企业案例库
 * 用途：EMBA 课前 / 课中 / 课后 的沉浸式案例研讨
 *
 * 数据口径说明：
 * - 金额为人民币、按财年；「未证实」标注表示仅有媒体或单一来源，未见年报或官方确认；
 * - 阶段标签为教学判断，并非企业官方表述；同一节点可能横跨两个阶段；
 * - `stageFit` 用于案例库的筛选与「按阶段推荐」。
 */

export const CASES = [
  {
    id: 'xiaomi',
    name: '小米',
    enName: 'Xiaomi',
    tagline: '手机 × AIoT × 汽车的三层生态',
    industry: '消费电子 / 智能硬件 / 新能源汽车',
    industryKey: 'tech',
    foundedYear: 2010,
    founders: '雷军（联合林斌、黎万强等）',
    stageFit: ['growth', 'expansion', 'transformation'],
    primaryStage: 'expansion',
    stageLabel: '扩张 → 转型',
    color: '#E06A3B',
    journey: [
      { year: 2010, stage: 'startup', event: '4 月创立，先做 MIUI 与论坛，用「100 个梦想赞助商」内测用户验证系统体验，再切入手机硬件。' },
      { year: 2011, stage: 'growth', event: '小米手机 1 以 1999 元发布、线上抢购；2014 年出货 6112 万台，IDC 中国份额 12.5% 第一。' },
      { year: 2016, stage: 'transformation', event: '销量跌出中国前三，雷军亲自接管供应链与质量，开小米之家补线下渠道。' },
      { year: 2021, stage: 'expansion', event: '宣布造车；2024 年 SU7 交付 136,854 台，形成手机 × AIoT × 汽车三层生态。' },
    ],
    elements: {
      user: [
        '从「为发烧而生」的极客种子用户起步，2014 年扩展到大众年轻用户，再到 2024 年「人车家全生态」用户。',
        '用米粉社区做需求共创，把用户反馈直接嵌进 MIUI 的每周迭代。',
      ],
      org: [
        '2016 年雷军亲自接管手机部与供应链；2018 年后引入卢伟冰等职业经理人补组织能力。',
        '造车业务独立成军，复用手机爆品与效率打法，但汽车供应链经验仍需补课。',
      ],
      product: [
        '2011 年小米 1 定价 1999 元击穿行业价格带，2013 年红米 799 元完成规模放量。',
        '2021 年起推高端化（小米 12/13），2024 年 SU7 以 21.59 万元起售切入轿车市场。',
      ],
      market: [
        '2011 年抓住智能手机换机潮与电商红利；2014 年后遭遇华为/荣耀与 OPPO/vivo 的线下竞争。',
        '2021 年抓住新能源车渗透率拐点，用消费电子品牌势能切入汽车。',
      ],
    },
    keyFacts: [
      { year: 2014, metric: '手机出货量', value: '6112 万台，同比 +227%，含税收入 743 亿元' },
      { year: 2018, metric: '港股 IPO', value: '7 月上市，发行价 17 港元，募资约 240 亿港元' },
      { year: 2024, metric: '营收与净利', value: '营收 3659 亿元，经调整净利 272 亿元' },
      { year: 2024, metric: '汽车交付', value: '136,854 台' },
      { year: 2024, metric: 'AIoT 连接设备', value: '8.6 亿台（2024Q3）' },
    ],
    turningPoint: {
      background: '2015—2016 年线上红利见顶、供应链与线下渠道短板暴露，销量跌出中国前三。',
      options: ['继续纯线上性价比', '降价保量', '补课线下与供应链', '冲高端'],
      choice: '雷军亲自接管供应链与质量，开小米之家，推 MIX 全面屏与自研芯片。',
      result: '2017 年逆转、2018 年上市；但「高端化」成为长期未结的课题。',
      best: 2,
      why: '本案例的正确答案不是「继续线上」或「降价」——那是把成长期的成功经验线性外推。真正的杠杆在组织要素：创始人亲自补上供应链与渠道能力，让组织能力追上用户规模。',
    },
    teachingInsight: '成长期赖以成功的「性价比 + 线上」，到扩张期会变成路径依赖；要素共演要求组织能力（供应链/渠道）与用户规模同步升级，否则增长会先于组织崩掉。',
    discussion: [
      '2016 年失速更像「要素失衡」还是「阶段错配」？',
      '造车对小米是「增益扩张」还是「升益转型」，判断标准是什么？',
    ],
    sources: [
      { label: '上海证券报 · 小米 2024 年报', url: 'https://m.cnstock.com/commonDetail/377089' },
      { label: '小米投资者关系', url: 'https://ir.mi.com/' },
    ],
  },
  {
    id: 'meituan',
    name: '美团',
    enName: 'Meituan',
    tagline: '从团购到「万物到家」的本地生活平台',
    industry: '本地生活服务 / 即时零售',
    industryKey: 'platform',
    foundedYear: 2010,
    founders: '王兴',
    stageFit: ['growth', 'expansion'],
    primaryStage: 'expansion',
    stageLabel: '成长 → 扩张',
    color: '#3E8E7E',
    journey: [
      { year: 2010, stage: 'startup', event: '美团网上线，千团大战中以「高效率、低毛利」跑出。' },
      { year: 2013, stage: 'growth', event: '外卖上线；2015 年与大众点评合并，形成到店 + 到家双引擎。' },
      { year: 2018, stage: 'expansion', event: '港交所上市；2020 年美团优选 / 买菜，2021 年反垄断罚款 34.42 亿元。' },
      { year: 2023, stage: 'transformation', event: '「零售 + 科技」组织重构，Keeta 出海香港、沙特。' },
    ],
    elements: {
      user: [
        '从一二线团购用户，到 2015 年后外卖「懒人经济」的全民用户，再到 2023 年「30 分钟达」的即时零售用户。',
        '用高频外卖带低频到店与酒旅，做用户终身价值。',
      ],
      org: [
        '2015 年合并后行双品牌与事业部制；2021 年反垄断后调整骑手权益与佣金。',
        '2023 年按到店、到家、优选重构组织，把决策权压到业务线。',
      ],
      product: [
        '2013 年外卖、2019 年美团闪购、2020 年美团优选、2023 年品牌卫星店。',
        '以「高频带低频」的商品结构，把流量成本摊薄到多个业务。',
      ],
      market: [
        '2015 年 O2O 资本寒冬与 BAT 站队；2020 年社区团购监管；2023 年抖音到店竞争。',
      ],
    },
    keyFacts: [
      { year: 2023, metric: '营收与订单', value: '营收 2767 亿元，即时配送 219 亿笔' },
      { year: 2024, metric: '营收与峰值', value: '营收 3376 亿元（+22%），即时配送日峰值 9800 万单' },
      { year: 2018, metric: '港股 IPO', value: '9 月上市，募资约 326 亿港元' },
      { year: 2021, metric: '反垄断罚款', value: '34.42 亿元' },
    ],
    turningPoint: {
      background: '千团大战烧钱，阿里投资但控制欲强，O2O 进入整合期。',
      options: ['接受阿里深度整合', '独立发展', '与大众点评合并并引入腾讯', '收缩战线只做到店'],
      choice: '与大众点评合并并引入腾讯。',
      result: '成为本地生活龙头、2018 年上市；但 2021 年反垄断与抖音竞争接踵而至。',
      best: 2,
      why: '合并的本质不是「消灭对手」，而是用资本与流量换时间，把竞争从烧钱拉回效率。这是一次典型的「市场要素」操作：用资本资源重排竞合格局。',
    },
    teachingInsight: '平台企业的要素共演是「用户—商户—骑手」三边网络的同步；组织边界（直营/加盟/外包）决定扩张的边际成本。',
    discussion: [
      '美团的扩张边界由用户需求决定，还是由组织能力决定？',
      '即时零售是「增益」还是「转型」？',
    ],
    sources: [
      { label: '美团 2024 年财报新闻', url: 'https://www.meituan.com/zh-HK/news/NN250321082001991' },
      { label: '美团投资者关系', url: 'https://ir.meituan.com/' },
    ],
  },
  {
    id: 'bytedance',
    name: '字节跳动',
    enName: 'ByteDance',
    tagline: '算法驱动的全球内容与电商平台',
    industry: '互联网内容 / 短视频 / 电商',
    industryKey: 'platform',
    foundedYear: 2012,
    founders: '张一鸣',
    stageFit: ['startup', 'growth', 'expansion', 'transformation'],
    primaryStage: 'expansion',
    stageLabel: '创业 → 扩张',
    color: '#4A6FA5',
    journey: [
      { year: 2012, stage: 'startup', event: '今日头条上线，用推荐算法验证「信息找人」。' },
      { year: 2016, stage: 'growth', event: '抖音上线；2017 年收购 Musical.ly，2018 年合并为 TikTok。' },
      { year: 2020, stage: 'expansion', event: '抖音日活破 6 亿、TikTok 全球月活 10 亿，广告 + 电商 + 本地生活多点扩张。' },
      { year: 2024, stage: 'transformation', event: '美国 TikTok「不卖就禁」法案签署，全球化被迫重排。' },
    ],
    elements: {
      user: [
        '从资讯用户到短视频表达用户，再到 TikTok 全球 10 亿月活；2023 年抖音电商用户成为第二增长曲线。',
      ],
      org: [
        '张一鸣推行 Context not Control、OKR 与中台；2021 年梁汝波接任 CEO，推行 BU 化。',
        '算法中台是跨业务复用的组织资产，而非某个产品部门的私有能力。',
      ],
      product: [
        '2012 今日头条、2016 抖音、2017 TikTok、2020 抖音电商；算法中台复用是核心杠杆。',
      ],
      market: [
        '2016 年 4G 普及与短视频风口；2020 年印度封禁 TikTok；2024 年美国立法围堵。',
      ],
    },
    keyFacts: [
      { year: 2020, metric: '抖音日活', value: '8 月破 6 亿（官方）' },
      { year: 2021, metric: 'TikTok 月活', value: '9 月全球 10 亿（官方）' },
      { year: 2023, metric: '营收与 EBITDA', value: '营收近 1200 亿美元、EBITDA 超 400 亿美元（媒体口径，未审计）', unverified: true },
      { year: 2024, metric: '美国 TikTok 法案', value: '4 月签署' },
    ],
    turningPoint: {
      background: '国内短视频竞争白热化，出海窗口打开。',
      options: ['自研海外产品', '收购成熟标的并本土化', '放弃出海', '只做工具类出海'],
      choice: '约 10 亿美元收购 Musical.ly 并合并为 TikTok。',
      result: '拿下全球短视频第一；但 2020 年后地缘政治风险成为最大变量。',
      best: 1,
      why: '收购带来的是「时间」：本土化运营 + 算法复用让窗口期被压到最短。但市场要素（监管、地缘）能一夜改写扩张边界，这也是本案例留给转型期的最重要悬念。',
    },
    teachingInsight: '算法作为「可复用技术要素」是扩张杠杆；但市场要素（监管/地缘）能一夜改写扩张边界，转型必须预置 AB 方案。',
    discussion: [
      '字节的算法中台是组织能力还是产品能力？',
      '若 TikTok 被迫剥离，四要素应如何重排？',
    ],
    sources: [
      { label: '财联社 · 字节 2023 业绩', url: 'https://api3.cls.cn/share/article/1642521' },
      { label: '字节跳动官网', url: 'https://www.bytedance.com/' },
    ],
  },
  {
    id: 'pinduoduo',
    name: '拼多多',
    enName: 'PDD Holdings',
    tagline: '社交拼团 + 低价供应链的电商平台',
    industry: '电商 / 农业科技',
    industryKey: 'platform',
    foundedYear: 2015,
    founders: '黄峥',
    stageFit: ['startup', 'growth', 'expansion'],
    primaryStage: 'growth',
    stageLabel: '创业 → 成长 → 扩张',
    color: '#C0453B',
    journey: [
      { year: 2015, stage: 'startup', event: '拼好货 / 拼多多以微信拼团裂变冷启动。' },
      { year: 2018, stage: 'growth', event: '纳斯达克 IPO，用「百亿补贴」攻入一二线。' },
      { year: 2020, stage: 'expansion', event: '多多买菜、农业科技；2021 年活跃买家 8.69 亿。' },
      { year: 2022, stage: 'transformation', event: 'Temu 全托管出海；2023 年 11 月市值一度超越阿里。' },
    ],
    elements: {
      user: [
        '从「五环外」价格敏感用户，到 2019 年百亿补贴拉新的一二线用户，再到 Temu 海外用户。',
        '不是「下沉」，而是重新定义了「什么值得买」。',
      ],
      org: [
        '极简总部 + 赛马机制；2021 年黄峥卸任、陈磊接任，推行「农业科技」。',
      ],
      product: [
        '2015 拼团、2019 百亿补贴、2020 多多买菜、2022 Temu 全托管。',
      ],
      market: [
        '2017 年微信流量红利；2020 年社区团购风口；2023 年出海关税与合规风险。',
      ],
    },
    keyFacts: [
      { year: 2018, metric: 'IPO 募资', value: '7 月募资 16.3 亿美元' },
      { year: 2021, metric: '年活跃买家', value: '8.69 亿' },
      { year: 2023, metric: '营收与净利', value: '营收 2476 亿元，净利 600 亿元' },
      { year: 2024, metric: '营收与净利', value: '营收 3938 亿元，净利 1124 亿元（Non-GAAP 1223 亿元）' },
      { year: 2023, metric: '市值', value: '11 月盘中一度超越阿里' },
    ],
    turningPoint: {
      background: '主站用户增长见顶，社区团购成新风口。',
      options: ['守主站', '做社区团购并深耕农业', '直接出海', '收购内容平台'],
      choice: '农业 + 多多买菜，2022 年再推 Temu。',
      result: '第二曲线成立、2023 年市值超阿里；但 Temu 面临合规与关税不确定性。',
      best: 1,
      why: '这一步的关键不是「再做一个业务」，而是把用户价值往前推到供应链：从「便宜」变成「便宜得有道理」。农业是产品要素与用户要素的共演。',
    },
    teachingInsight: '「低价」不是产品策略，而是用户价值重构；组织极简让试错成本低，但全球化时「市场要素」最难迁移。',
    discussion: [
      '拼多多的低价是「用户洞察」还是「补贴幻觉」？',
      'Temu 复制到海外，哪个要素最不可迁移？',
    ],
    sources: [
      { label: '中国证券报 · 拼多多 2024 业绩', url: 'https://jnzstatic.cs.com.cn/zzb/htmlInfo/c6bc714b9b3e4e418db7aae23fa531fb.html' },
      { label: '拼多多投资者关系', url: 'https://investor.pddholdings.com/' },
    ],
  },
  {
    id: 'nio',
    name: '蔚来',
    enName: 'NIO',
    tagline: '用户企业 + 换电服务的高端电动车',
    industry: '新能源汽车',
    industryKey: 'ev',
    foundedYear: 2014,
    founders: '李斌',
    stageFit: ['startup', 'growth', 'transformation'],
    primaryStage: 'transformation',
    stageLabel: '创业 → 成长 → 危机转型',
    color: '#2F7FA0',
    journey: [
      { year: 2014, stage: 'startup', event: '创立并跑 Formula E、发 EP9，用赛道与技术品牌立信。' },
      { year: 2018, stage: 'growth', event: 'ES8 交付、纽交所 IPO。' },
      { year: 2019, stage: 'transformation', event: '电池召回、股价跌至 1.19 美元、合肥 70 亿战略投资。' },
      { year: 2021, stage: 'expansion', event: 'ET7 / ET5、换电站约 3000 座、乐道 / 萤火虫多品牌。' },
    ],
    elements: {
      user: [
        '从「敢尝鲜的高净值用户」，到 NIO House / APP 的「用户企业」社区，再到 2024 年乐道覆盖家庭用户。',
        '把用户关系做成资产：NIO Day、用户信托、车主志愿者。',
      ],
      org: [
        '2019 年裁员收缩；2020 年合肥战投后重建；2023 年多品牌组织分权。',
      ],
      product: [
        '2017 ES8、2021 ET7、2022 换电网络、2024 乐道 L60 / 萤火虫。',
      ],
      market: [
        '2019 年补贴退坡与资本寒冬；2020 年合肥政府；2023 年价格战。',
      ],
    },
    keyFacts: [
      { year: 2018, metric: 'IPO 募资', value: '9 月约 10 亿美元' },
      { year: 2020, metric: '合肥战略投资', value: '70 亿元' },
      { year: 2023, metric: '交付与营收', value: '交付 16.0 万辆，营收 556.2 亿元，净亏 207.2 亿元' },
      { year: 2024, metric: '交付与营收', value: '交付 22.2 万辆，营收 657.3 亿元' },
      { year: 2024, metric: '换电站', value: '约 3000 座（含高速，口径）' },
    ],
    turningPoint: {
      background: '2019 年召回、亏损、融资无门，股价 1.19 美元，李斌被称为「2019 年最惨的人」。',
      options: ['被收购', '破产重组', '接受合肥政府战略投资', '收缩为小众品牌'],
      choice: '合肥 70 亿元 + 对赌。',
      result: '活下来、2020 年毛利率转正；但 2023—2024 仍大额亏损。',
      best: 2,
      why: '这是「资本资源」要素救场的典型案例：当产品与用户价值都成立、但现金流断裂时，活下去是第一战略。代价是对赌条款把未来几年的增长压力提前锁定。',
    },
    teachingInsight: '「用户企业」是差异化资产，但重资产换电网络在扩张期会放大资金压力；用户价值与成本结构必须同频。',
    discussion: [
      '蔚来的「用户企业」是护城河还是成本包袱？',
      '换电 vs 超充，哪个更符合阶段跃迁？',
    ],
    sources: [
      { label: '新京报 · 蔚来 2024 业绩', url: 'https://news.qq.com/rain/a/20250321A086YK00' },
      { label: '蔚来投资者关系', url: 'https://ir.nio.com/' },
    ],
  },
  {
    id: 'byd',
    name: '比亚迪',
    enName: 'BYD',
    tagline: '垂直整合的新能源汽车与电池巨头',
    industry: '新能源汽车 / 动力电池',
    industryKey: 'ev',
    foundedYear: 1995,
    founders: '王传福',
    stageFit: ['growth', 'expansion', 'transformation'],
    primaryStage: 'transformation',
    stageLabel: '扩张 → 转型',
    color: '#B8862B',
    journey: [
      { year: 1995, stage: 'startup', event: '充电电池起家，用「半自动化 + 低成本」切入。' },
      { year: 2003, stage: 'growth', event: '收购秦川汽车；2008 年巴菲特入股、F3DM 上市。' },
      { year: 2010, stage: 'expansion', event: '太阳能 / 储能 / 云轨多元化，2020 年刀片电池。' },
      { year: 2022, stage: 'transformation', event: '停产燃油车，2023 年 302 万辆、2024 年 427 万辆。' },
    ],
    elements: {
      user: [
        '从电池 B 端客户到 F3 燃油车用户，再到 DM-i「油电同价」的大众用户与海外用户。',
      ],
      org: [
        '垂直整合 / 事业部制（电池、半导体、汽车）；2022 年后向仰望、腾势等高端品牌分权。',
        '垂直整合的本质是把「供应商能力」内化为「组织能力」。',
      ],
      product: [
        '2008 F3DM、2020 刀片电池、2021 DM-i、2023 仰望 U8。',
      ],
      market: [
        '2008 年巴菲特背书；2020 年双积分 / 补贴；2023 年价格战与欧盟关税。',
      ],
    },
    keyFacts: [
      { year: 2008, metric: '巴菲特投资', value: 'MidAmerican 投资 2.3 亿美元、占 9.89%' },
      { year: 2023, metric: '销量与营收', value: '销量 302.44 万辆，营收 6023 亿元' },
      { year: 2024, metric: '销量与营收', value: '销量 427.21 万辆，营收 7771 亿元，净利约 402.5 亿元' },
      { year: 2024, metric: '海外销量', value: '41.7 万辆' },
      { year: 2024, metric: '研发投入', value: '542 亿元' },
    ],
    turningPoint: {
      background: '新能源渗透率快速提升，燃油车业务持续萎缩。',
      options: ['油电并行', '全面电动', '聚焦高端', '转向海外'],
      choice: '2022 年 3 月停产燃油车。',
      result: '2023 年全球新能源销量第一；但 2024—2025 价格战与高端化成为新坎。',
      best: 1,
      why: '停产燃油车是「除法」：主动放弃仍有现金流的旧曲线，把资源集中到新曲线。这个决定的底气来自十多年的垂直整合——技术要素的长期主义在转型期兑现。',
    },
    teachingInsight: '技术要素的长期投入（电池/IGBT/垂直整合）在转型期兑现为成本优势；但组织庞大后的效率与品牌向上是下一道关。',
    discussion: [
      '垂直整合的边界在哪里？',
      '比亚迪高端化为什么难？',
    ],
    sources: [
      { label: '每日经济新闻 · 比亚迪 2024 年报', url: 'https://www.sohu.com/a/875386200_115362' },
      { label: '比亚迪官网', url: 'https://www.byd.com/' },
    ],
  },
  {
    id: 'huawei',
    name: '华为',
    enName: 'Huawei',
    tagline: '从代理商到全球 ICT 与终端巨头',
    industry: 'ICT / 通信设备 / 终端',
    industryKey: 'tech',
    foundedYear: 1987,
    founders: '任正非',
    stageFit: ['growth', 'expansion', 'transformation'],
    primaryStage: 'transformation',
    stageLabel: '扩张 → 极限转型',
    color: '#B03A3A',
    journey: [
      { year: 1987, stage: 'startup', event: '交换机代理转自研，农村包围城市。' },
      { year: 1998, stage: 'growth', event: 'IPD / ISC 变革、全球化，从「土狼」变「正规军」。' },
      { year: 2010, stage: 'expansion', event: '终端 / 消费者业务崛起；2019 年实体清单、2020 年出售荣耀。' },
      { year: 2023, stage: 'transformation', event: 'Mate 60 回归、鸿蒙 / 昇腾，2024 年营收 8621 亿元。' },
    ],
    elements: {
      user: [
        '从运营商客户到 2010 年后的大众消费者，再到 2023 年「鸿蒙生态」用户。',
      ],
      org: [
        '1998 年引入 IBM 的 IPD / ISC；2019 年「军团」组织；2020 年荣耀剥离。',
        '「备胎」不是临时应对，而是长期的组织冗余设计。',
      ],
      product: [
        '2019 鸿蒙、2023 Mate 60、2024 鸿蒙 NEXT / 昇腾。',
      ],
      market: [
        '2019 实体清单、2020 芯片断供、2023 国产替代窗口。',
      ],
    },
    keyFacts: [
      { year: 2024, metric: '营收与净利', value: '营收 8621 亿元，净利 626 亿元（KPMG 审计）' },
      { year: 2023, metric: '研发投入', value: '1647 亿元，占营收 23.4%' },
      { year: 2019, metric: '实体清单', value: '5 月被列入；2020 年 11 月出售荣耀（金额未披露）' },
      { year: 2024, metric: '智能汽车解决方案收入', value: '263.5 亿元' },
    ],
    turningPoint: {
      background: 'GMS 与先进芯片断供，消费者业务几近停摆。',
      options: ['妥协', '收缩', '自研替代', '转做纯软件'],
      choice: '鸿蒙 + 海思 + 车 BU +「南泥湾」计划。',
      result: '2023 年 Mate 60 回归、2024 年营收接近历史峰值；先进制程仍受限。',
      best: 2,
      why: '制裁属于「市场要素」的剧烈突变，企业无法改变规则，只能改变自己的要素结构：用技术要素（海思/鸿蒙）替代被切断的外部依赖，用组织要素（军团）重组作战单元。',
    },
    teachingInsight: '转型期的「组织韧性」与「备胎」是要素共演的缓冲；市场要素（地缘）能瞬间改写规则，企业要把「极限生存」纳入战略假设。',
    discussion: [
      '华为的「备胎」是战略远见还是资源浪费？',
      '制裁下应优先保哪两个要素？',
    ],
    sources: [
      { label: '华为 2024 年年报', url: 'https://www.huawei.com/cn/news/2025/3/annual-report-2024' },
      { label: '华为官网', url: 'https://www.huawei.com/' },
    ],
  },
  {
    id: 'haier',
    name: '海尔',
    enName: 'Haier',
    tagline: '人单合一驱动的物联网生态品牌',
    industry: '家电 / 物联网',
    industryKey: 'manufacturing',
    foundedYear: 1984,
    founders: '张瑞敏',
    stageFit: ['expansion', 'transformation'],
    primaryStage: 'transformation',
    stageLabel: '扩张 → 组织转型',
    color: '#4C7A9E',
    journey: [
      { year: 1984, stage: 'startup', event: '青岛电冰箱总厂，砸冰箱、名牌战略。' },
      { year: 1991, stage: 'growth', event: '多元化、国际化、流程再造。' },
      { year: 2005, stage: 'expansion', event: '人单合一、小微；2016 年收购 GE 家电。' },
      { year: 2021, stage: 'transformation', event: '周云杰接任，卡奥斯 / 三翼鸟。' },
    ],
    elements: {
      user: [
        '从「质量可靠」的冰箱用户，到成套家电 / 智慧家庭用户，再到卡奥斯工业互联网 B 端用户。',
      ],
      org: [
        '2005 年人单合一、小微 / 链群；2016 年收购 GE 家电后行「沙拉式文化」。',
        '组织变革本身就是转型的「元要素」。',
      ],
      product: [
        '1984 冰箱、2020 三翼鸟场景品牌、卡奥斯工业互联网。',
      ],
      market: [
        '2001 年中国入世后出海；2016 年 GE 家电；2020 年物联网窗口。',
      ],
    },
    keyFacts: [
      { year: 2023, metric: '营收与净利', value: '营收 2614 亿元，净利 166 亿元' },
      { year: 2024, metric: '营收与净利', value: '营收 2859.81 亿元，净利 187.41 亿元' },
      { year: 2016, metric: '收购 GE 家电', value: '55.8 亿美元' },
      { year: 2023, metric: '全球排名', value: '欧睿国际全球大型家电零售量连续 15 年第一' },
    ],
    turningPoint: {
      background: '大企业病、科层僵化，传统制造模式见顶。',
      options: ['维持科层', '学 GE 六西格玛', '自主经营体 / 人单合一', '分拆上市'],
      choice: '人单合一 + 小微。',
      result: '组织激活、支撑 GE 家电整合；但模式复杂、协同成本高。',
      best: 2,
      why: '海尔选择的不是「换产品」，而是「换组织的操作系统」。当组织要素成为瓶颈时，组织变革本身就是最高级的战略动作——这是「组织即战略」的极端样本。',
    },
    teachingInsight: '组织变革可以成为转型的「元要素」；大企业转型不是换产品，而是换组织操作系统。',
    discussion: [
      '人单合一能否复制到非制造企业？',
      '收购 GE 家电是「扩张」还是「转型」？',
    ],
    sources: [
      { label: '中国证券报 · 海尔智家 2024 年报', url: 'https://jnzstatic.cs.com.cn/zzb/htmlInfo/ced361627c29b743b87a69d7f244a409.html' },
      { label: '海尔官网', url: 'https://www.haier.com/' },
    ],
  },
  {
    id: 'saturnbird',
    name: '三顿半',
    enName: 'Saturnbird',
    tagline: '超即溶精品咖啡的品类开创者',
    industry: '咖啡 / 新消费',
    industryKey: 'consumer',
    foundedYear: 2015,
    founders: '吴骏',
    stageFit: ['startup', 'growth'],
    primaryStage: 'startup',
    stageLabel: '精益创业',
    color: '#D08A34',
    journey: [
      { year: 2015, stage: 'startup', event: '长沙精品咖啡 / 挂耳电商，小团队试错。' },
      { year: 2018, stage: 'growth', event: '小罐「超即溶」上市，2019 年天猫双 11 咖啡类目第一。' },
      { year: 2020, stage: 'expansion', event: '疫情居家咖啡爆发，B 轮融资，线下「原力飞行」。' },
      { year: 2022, stage: 'transformation', event: '品牌矩阵、返航计划、线下探索（进行中）。' },
    ],
    elements: {
      user: [
        '从精品咖啡爱好者，到「冷水 / 牛奶 3 秒溶」的年轻通勤用户，再到礼盒 / 联名用户。',
        '用「返航计划」把空罐回收变成用户身份仪式。',
      ],
      org: [
        '创始人 + 小团队、产品与内容一体化；2020 年后补供应链与线下团队。',
      ],
      product: [
        '2018 小罐超即溶、2019 返航计划（空罐回收）、2021 上海原力飞行。',
      ],
      market: [
        '2019 年天猫咖啡赛道爆发；2020 年疫情居家；2021 年新消费资本退潮。',
      ],
    },
    keyFacts: [
      { year: 2015, metric: '品牌成立', value: '4 月成立；2018 年超即溶上市' },
      { year: 2021, metric: '天猫双 11', value: '2019—2021 连续三年咖啡类目 Top1（FoodTalks 口径）' },
      { year: 2020, metric: '累计销量', value: '截至 8 月卖出逾 6000 万杯（媒体口径）', unverified: true },
      { year: 2020, metric: 'B 轮融资', value: '9 月红杉中国领投（金额未披露）' },
      { year: 2021, metric: '股权融资', value: '5 月中信产业基金领投（金额未披露）' },
    ],
    turningPoint: {
      background: '挂耳同质化、速溶被雀巢占据，精品咖啡难破圈。',
      options: ['继续做挂耳', '开线下精品店', '做超即溶并重做包装', '做咖啡机'],
      choice: '超即溶 + 高颜值小罐。',
      result: '品类第一；但 2021 年后增长放缓，线下与品牌溢价待验证。',
      best: 2,
      why: '精益创业的关键不是「做小」，而是用一个尖锐的「产品—场景」假设切入巨头缝隙：把「精品咖啡」从仪式感场景搬到「3 秒溶」的碎片场景。',
    },
    teachingInsight: '精益创业的关键不是「做小」，而是用一个尖锐的「产品—场景」假设切入巨头缝隙；成长后必须补组织与供应链。',
    discussion: [
      '三顿半的护城河是产品还是品牌？',
      '新消费「爆品」如何跨过成长期？',
    ],
    sources: [
      { label: 'FoodTalks · 三顿半公司库', url: 'https://www.foodtalks.cn/company/saturnbird' },
      { label: '三顿半官网', url: 'https://www.saturnbird.com/' },
    ],
  },
  {
    id: 'catl',
    name: '宁德时代',
    enName: 'CATL',
    tagline: '全球动力电池与储能龙头',
    industry: '动力电池 / 储能',
    industryKey: 'ev',
    foundedYear: 2011,
    founders: '曾毓群',
    stageFit: ['growth', 'expansion'],
    primaryStage: 'growth',
    stageLabel: '成长 → 扩张',
    color: '#2C7A6B',
    journey: [
      { year: 2011, stage: 'startup', event: '从 ATL 剥离，2012 年拿下宝马订单。' },
      { year: 2015, stage: 'growth', event: '磷酸铁锂 / 三元放量，2017 年全球出货第一。' },
      { year: 2018, stage: 'expansion', event: '深交所 IPO、特斯拉 / 海外、麒麟 / 钠电。' },
      { year: 2023, stage: 'transformation', event: '市占率 37.9%、欧洲工厂、储能第二曲线。' },
    ],
    elements: {
      user: [
        '从客车客户到乘用车企（宝马 / 特斯拉 / 蔚来），再到储能 / 换电 B 端客户。',
      ],
      org: [
        '2011 年独立、2018 年上市；2022 年按动力、储能、回收分组织。',
      ],
      product: [
        '2017 三元、2020 CTP、2021 钠离子、2022 麒麟、2023 神行超充。',
      ],
      market: [
        '2012 宝马背书；2020 特斯拉；2023 欧盟电池法规 / 美国 IRA。',
      ],
    },
    keyFacts: [
      { year: 2018, metric: 'IPO 募资', value: '6 月深交所募资 54.6 亿元' },
      { year: 2023, metric: '营收与市占率', value: '营收 4009 亿元，净利 441 亿元，全球市占率 36.8%' },
      { year: 2024, metric: '营收与净利', value: '营收 3620 亿元，净利 507.45 亿元' },
      { year: 2024, metric: '全球市占率', value: '动力电池 37.9%，储能电池 36.5%（SNE）' },
      { year: 2024, metric: '全球排名', value: '2017—2024 连续 8 年动力电池使用量第一' },
    ],
    turningPoint: {
      background: '初创无乘用车背书，只能从客车与低价单切入。',
      options: ['低价抢国内客车单', '接受宝马的严苛标准', '先做储能', '绑定一家新势力'],
      choice: '接受宝马的严苛标准。',
      result: '技术与质量体系升级，2017 年登顶全球。',
      best: 1,
      why: '在成长早期，「大客户的严格要求」比「短期的低价订单」更值钱——它把客户标准转化为组织能力。这是「专益成长」阶段最典型的要素共演：用户升级倒逼产品与组织升级。',
    },
    teachingInsight: '「专益成长」靠深度绑定头部客户；扩张期用资本 / 产能，转型期用技术路线（钠电 / 储能 / 换电）对冲。',
    discussion: [
      '市占率是护城河还是客户集中风险？',
      '车企自研电池下，宁德如何共演？',
    ],
    sources: [
      { label: '上海证券报 · 宁德时代 2024 年报', url: 'https://m.cnstock.com/commonDetail/375609' },
      { label: '宁德时代官网', url: 'https://www.catl.com/' },
    ],
  },
];

/** 反例：要素失衡的代价 */
export const COUNTER_CASES = [
  {
    id: 'ofo',
    name: 'ofo 小黄车',
    years: '2014—2018',
    stage: '扩张期',
    story: '靠资本闪电战铺城，单车损耗与运维成本失控、押金池被挪用；城市团队膨胀而组织失序，2018 年资金链断裂。',
    imbalance: ['product', 'org'],
    lesson: '扩张的边际成本没有随规模下降，反而上升——这是「增益」失败的典型：增加的是摊薄，不是增量。',
  },
  {
    id: 'leeco',
    name: '乐视',
    years: '2010—2017',
    stage: '扩张期',
    story: '以「生态化反」横跨视频、电视、手机、汽车等七大子生态，用上市公司股权质押输血非上市业务；2016 年资金链断裂。',
    imbalance: ['market', 'org'],
    lesson: '当「故事」的扩张速度超过「组织」的承载能力，生态就变成债务。范围经济的前提是能力可复用。',
  },
  {
    id: 'evergrande-ev',
    name: '恒大汽车',
    years: '2018—2021',
    stage: '转型期',
    story: '跨界造车沿用地产高杠杆与「买买买」打法，缺乏三电技术与整车组织能力；2021 年恒大暴雷，恒驰 5 交付寥寥。',
    imbalance: ['product', 'org'],
    lesson: '转型不是「进入一个新行业」，而是重建一套新能力。用旧组织的惯性做新曲线，是最贵的错误。',
  },
  {
    id: 'missfresh',
    name: '每日优鲜',
    years: '2014—2022',
    stage: '扩张期',
    story: '前置仓扩张期单仓履约成本高、损耗大，2021 年上市后仍持续失血，2022 年解散。',
    imbalance: ['product', 'market'],
    lesson: '单位经济模型（UE）为负时，规模越大亏得越多。扩张之前，先确认每一单都是「增益」。',
  },
];

/** 案例—阶段矩阵（教学建议） */
export const CASE_STAGE_MATRIX = [
  { caseId: 'saturnbird', fit: { startup: 'primary', growth: 'secondary' } },
  { caseId: 'pinduoduo', fit: { startup: 'primary', growth: 'primary', expansion: 'secondary' } },
  { caseId: 'bytedance', fit: { startup: 'primary', growth: 'primary', expansion: 'primary', transformation: 'secondary' } },
  { caseId: 'xiaomi', fit: { startup: 'secondary', growth: 'primary', expansion: 'primary', transformation: 'primary' } },
  { caseId: 'meituan', fit: { growth: 'primary', expansion: 'primary', transformation: 'secondary' } },
  { caseId: 'catl', fit: { startup: 'secondary', growth: 'primary', expansion: 'primary', transformation: 'secondary' } },
  { caseId: 'byd', fit: { growth: 'secondary', expansion: 'primary', transformation: 'primary' } },
  { caseId: 'nio', fit: { startup: 'secondary', growth: 'primary', expansion: 'secondary', transformation: 'primary' } },
  { caseId: 'huawei', fit: { growth: 'secondary', expansion: 'secondary', transformation: 'primary' } },
  { caseId: 'haier', fit: { startup: 'secondary', growth: 'secondary', expansion: 'primary', transformation: 'primary' } },
];

export const caseById = Object.fromEntries(CASES.map((c) => [c.id, c]));

export const INDUSTRIES = [
  { key: 'all', label: '全部行业' },
  { key: 'tech', label: '科技 / 硬件' },
  { key: 'platform', label: '平台 / 互联网' },
  { key: 'ev', label: '新能源 / 汽车' },
  { key: 'manufacturing', label: '制造 / 家电' },
  { key: 'consumer', label: '消费 / 新品牌' },
];
