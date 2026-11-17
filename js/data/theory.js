/**
 * 共演战略 · 核心理论数据
 * 理论基石：路江涌《共演战略：重新定义企业生命周期》（机械工业出版社，2018）
 *           路江涌《共演战略画布》（机械工业出版社，2019）
 *
 * 数据说明：
 * - 48 演化矩阵（12 要点 × 4 阶段）的要点名称，依据作者配套教具画布与原著章节整理；
 * - 每个格子的「解释文字」为教学化转述，不替代原书表述；
 * - 四问采用原书「why / who / what / where」统一模板，具体措辞按阶段转述。
 */

export const META = {
  title: '共演战略画布',
  subtitle: '企业生命周期中的四要素共演',
  author: '路江涌',
  institution: '北京大学光华管理学院',
  book: '《共演战略画布》，机械工业出版社，2019',
  formula: '1 · 2 · 4 · 6 · 12 · 48',
  formulaMeaning: [
    { n: '1', label: '个环境特征', desc: '复杂 ＝ 不确定性 × 不连续性' },
    { n: '2', label: '个维度', desc: '人与事、内与外' },
    { n: '4', label: '个要素 / 阶段 / 路径', desc: '用户·组织·产品·市场；创业·成长·扩张·转型' },
    { n: '6', label: '个战略问题', desc: 'Why · Who · What · Where · When · How' },
    { n: '12', label: '个战略要点', desc: '四要素 × 三个分析维度' },
    { n: '48', label: '个战略演化', desc: '12 要点 × 4 阶段' },
  ],
};

export const DIMENSIONS = {
  vertical: { top: '人', bottom: '事', note: '「人」是企业的组成主体，「事」是企业的价值客体。' },
  horizontal: { left: '内', right: '外', note: '「内」是企业边界之内可控的能力，「外」是边界之外必须回应的关系。' },
};

/** 四要素：内/外 × 人/事的二维定位（顺序与画布象限一致：左上 → 右上 → 左下 → 右下） */
export const ELEMENTS = [
  {
    key: 'org',
    label: '组织',
    en: 'Organization',
    tagline: '企业能力之源',
    axis: '内 · 人',
    quadrant: 'tl',
    color: 'var(--el-org)',
    colorSoft: 'var(--el-org-soft)',
    colorInk: 'var(--el-org-ink)',
    desc: '组织是企业内部的人，也是企业能力的来源。领导者是头，团队员工是肢体，组织管理是神经系统。组织不是背景板，而是战略能否落地的容器。',
    question: '谁来做、谁负责、凭什么协同？',
    points: ['leader', 'team', 'structure'],
    fallacy: '战略升级了，组织还停在上一阶段——组织是战略的滞后变量。',
  },
  {
    key: 'user',
    label: '用户',
    en: 'User',
    tagline: '企业存在之因',
    axis: '外 · 人',
    quadrant: 'tr',
    color: 'var(--el-user)',
    colorSoft: 'var(--el-user-soft)',
    colorInk: 'var(--el-user-ink)',
    desc: '用户是企业外部的人，也是企业存在的理由。不是一张「客户名单」，而是三个必须持续回答的问题：他们是谁、他们要什么、他们为什么选你。',
    question: '我们为谁、解决了什么非解决不可的问题？',
    points: ['characteristics', 'needs', 'choice'],
    fallacy: '把「用户画像」当成用户本身，把「我们想给的」当成「用户想要的」。',
  },
  {
    key: 'product',
    label: '产品',
    en: 'Product',
    tagline: '企业价值之基',
    axis: '内 · 事',
    quadrant: 'bl',
    color: 'var(--el-product)',
    colorSoft: 'var(--el-product-soft)',
    colorInk: 'var(--el-product-ink)',
    desc: '产品是企业内部的事，也是企业价值的载体。产品开发定义「交付什么」，营销推广定义「如何被理解」，商业模式定义「价值如何变成收入」。',
    question: '我们交付的价值，如何被感知、被付费、被复用？',
    points: ['development', 'marketing', 'businessModel'],
    fallacy: '把功能迭代当产品进化，把流量投放当增长引擎。',
  },
  {
    key: 'market',
    label: '市场',
    en: 'Market',
    tagline: '企业未来之路',
    axis: '外 · 事',
    quadrant: 'br',
    color: 'var(--el-market)',
    colorSoft: 'var(--el-market-soft)',
    colorInk: 'var(--el-market-ink)',
    desc: '市场是企业外部的事，也是企业的未来之路。技术趋势划定可能性边界，资本资源决定推进速度，市场竞合格局决定生存空间。',
    question: '外部世界正在奖励什么、惩罚什么？',
    points: ['tech', 'capital', 'competition'],
    fallacy: '只盯竞争对手的招式，不察技术范式与资本周期的更替。',
  },
];

/** 12 个战略要点：四要素 × 三个分析维度 */
export const POINTS = [
  { key: 'characteristics', el: 'user', label: '用户特征', en: 'Who', q: '他们是谁？', desc: '用户的人口属性、行为属性与心理属性，决定需求的结构与规模。' },
  { key: 'needs', el: 'user', label: '用户需求', en: 'Why', q: '为什么买？', desc: '用户在什么场景下、为了消除什么痛苦或获得什么快乐而付费。' },
  { key: 'choice', el: 'user', label: '用户选择', en: 'Which', q: '为何选你？', desc: '用户在众多替代方案中的判断依据与决策路径。' },
  { key: 'leader', el: 'org', label: '领导者', en: 'Head', q: '谁定方向？', desc: '创始人与核心领导者的认知边界、使命强度与决策质量。' },
  { key: 'team', el: 'org', label: '团队员工', en: 'Body', q: '谁在执行？', desc: '团队的能力结构、协作方式与激励相容程度。' },
  { key: 'structure', el: 'org', label: '组织管理', en: 'Nerve', q: '如何协同？', desc: '组织结构、制度与文化，决定战略落地的效率与韧性。' },
  { key: 'development', el: 'product', label: '产品开发', en: 'What', q: '交付什么？', desc: '从需求到产品的转化能力：定义、验证、迭代、规模化。' },
  { key: 'marketing', el: 'product', label: '营销推广', en: 'How', q: '如何触达？', desc: '价值被感知与传播的方式：渠道、内容、口碑与品牌。' },
  { key: 'businessModel', el: 'product', label: '商业模式', en: 'Earn', q: '如何盈利？', desc: '价值创造、价值传递与价值获取的闭环设计。' },
  { key: 'tech', el: 'market', label: '技术趋势', en: 'Tech', q: '什么在变？', desc: '技术范式变迁带来的机会窗口与能力重构压力。' },
  { key: 'capital', el: 'market', label: '资本资源', en: 'Capital', q: '谁在助推？', desc: '资金来源、资本结构与资源配置节奏对战略的约束与赋能。' },
  { key: 'competition', el: 'market', label: '市场竞合', en: 'Rivalry', q: '与谁共舞？', desc: '竞争者的意图、行业格局的演化与生态位选择。' },
];

/**
 * 48 演化矩阵（原书核心表）
 * 行：12 个战略要点；列：4 个阶段。
 * label 为该书要点名，desc 为教学化解释。
 */
const MATRIX = {
  characteristics: [
    { label: '天使用户', desc: '最早认同产品、并愿意帮产品说话的那批人。他们是需求的放大器，也是产品的共同创造者。' },
    { label: '大众用户', desc: '从早期尝鲜者走向主流人群。跨越的不只是人数，更是购买理由与使用场景。' },
    { label: '累积用户', desc: '用户资产开始复利：规模、数据、关系网络本身成为竞争壁垒。' },
    { label: '重识用户', desc: '回到原点重新回答「我们为谁服务」。旧地图找不到新大陆。' },
  ],
  needs: [
    { label: '爽痛点需求', desc: '人只为两件事付费：对抗痛苦、追求快乐。找到「不解决就难受」的那一个点。' },
    { label: '普遍需求', desc: '从一个小众的痛，扩展为一群人的普遍需求，需求强度决定增长上限。' },
    { label: '多元需求', desc: '同一批用户长出多种需求，需求开始分层、分场景、分人群。' },
    { label: '潜在需求', desc: '用户尚未说出口、甚至尚未意识到的需求，往往对应最大的机会。' },
  ],
  choice: [
    { label: '现有竞品', desc: '用户此刻用什么替代方案？替代方案才是真正的竞争对手。' },
    { label: '跨越需求鸿沟', desc: '从「少数人狂热」到「多数人接受」，中间隔着一道需求鸿沟。' },
    { label: '需求互补性', desc: '用一组互补的需求把用户留在体系内，单点价值变成组合价值。' },
    { label: '需求升 / 降级', desc: '消费升级与降级同时发生，选择站在哪一侧，决定新的用户结构。' },
  ],
  leader: [
    { label: '创始人', desc: '创始人精神：使命感、主人翁意识、重视一线、战略眼光。' },
    { label: '创始人成长', desc: '创始人的第一次角色转变：从「做事的人」变成「定方向、搭班子的人」。' },
    { label: '创始人成熟', desc: '从个人英雄到组织领袖，学会用制度、用人才、用资本放大判断力。' },
    { label: '重拾创始人精神', desc: '大企业病的最佳解药，是重新找回创业第一天的那种饥饿感。' },
  ],
  team: [
    { label: '创业合伙人', desc: '三驾马车：能看方向的人、能解技术难题的人、能带团队的人。' },
    { label: '团队专业化', desc: '关键岗位补位、专业分工，团队从「兄弟连」变成「专业军」。' },
    { label: '团队职业化', desc: '培养能独立带兵打仗的将领，而不只是培养执行者。' },
    { label: '激活组织', desc: '创客文化、内部创业、小微组织——让听得见炮声的人做决定。' },
  ],
  structure: [
    { label: '扁平组织', desc: '足够短的距离让决策贴近用户，足够透明让信息不被层级稀释。' },
    { label: '层级组织', desc: '规模上来之后，必要的层级与流程是效率的来源，也是官僚化的起点。' },
    { label: '事业部组织', desc: '分权与协同并重：业务单元自主经营，平台能力共享复用。' },
    { label: '无边界组织', desc: '耗散结构：打破部门墙、企业墙，用开放系统对抗熵增。' },
  ],
  development: [
    { label: 'MVP 开发', desc: '开发—测量—学习：用最小成本跑通一个完整的学习循环。' },
    { label: '爆款产品', desc: '把资源压在一个能击穿市场的主打产品上，用爆款完成规模跃迁。' },
    { label: '关联产品', desc: '围绕核心能力扩展产品组合，让每一次扩张都带来结构性增量。' },
    { label: '品类创新', desc: '不参与既有品类的竞争，而是定义一个属于自己的新品类。' },
  ],
  marketing: [
    { label: '口碑营销', desc: '100 个狂热粉丝，胜过 10000 个觉得还不错的人。' },
    { label: '广告营销', desc: '从口碑到品牌：建立可衡量、可复制的获客与转化漏斗。' },
    { label: '关联营销', desc: '多产品、多场景、多触点的整合营销，摊薄获客成本、放大用户终身价值。' },
    { label: '品类营销', desc: '营销的对象从「产品」升级为「品类」，让品牌成为品类的代名词。' },
  ],
  businessModel: [
    { label: '单点突破', desc: '点状模式：聚焦一个细分场景，快速做到局部领先。' },
    { label: '规模经济', desc: '线状模式：找到单位经济模型为正的增长单元，然后复制它。' },
    { label: '范围经济', desc: '面状模式：多种业务共享能力与资源，扩张带来结构性成本优势。' },
    { label: '生态经济', desc: '体状模式：让第三方在你的规则里创造价值，收入来自场域而非单品。' },
  ],
  tech: [
    { label: '创新性技术', desc: '用新技术解决老问题，或用新方式把老行业重做一遍。' },
    { label: '成长性技术', desc: '技术从「能用」到「好用」，开始形成可积累的壁垒。' },
    { label: '主导设计', desc: '技术路线趋于收敛，谁定义了主导设计，谁就掌握了行业标准。' },
    { label: '范式变革', desc: '技术范式的整体替换，旧能力可能瞬间贬值，也可能瞬间升值。' },
  ],
  capital: [
    { label: '初始资本', desc: '自有资金、天使投资与政府资金，决定你能够试错几次。' },
    { label: '精益融资', desc: '用外部资本换取速度，同时接受增长与回报的约定。' },
    { label: '资本运营', desc: '并购、分拆、上市、战略投资——资本从「燃料」变成「工具」。' },
    { label: '公司创投', desc: '用投资的方式布局未来，把转型的风险分散到多个新曲线。' },
  ],
  competition: [
    { label: '混沌市场', desc: '规则未定、玩家未明，正是切入的最佳时刻。' },
    { label: '蓝海市场', desc: '需求快速释放、竞争尚未成形的窗口期。' },
    { label: '红海市场', desc: '存量博弈、同质化竞争，必须在效率或差异上做出选择。' },
    { label: '蓝冰市场', desc: '看似坚固、实则正在融化的市场：旧规则失效，新规则未立。' },
  ],
};

/** 四阶段：精 · 专 · 增 · 升 */
export const STAGES = [
  {
    key: 'startup',
    index: 1,
    label: '精益创业',
    short: '创业',
    code: '精',
    span: '从 0 到 1',
    color: 'var(--el-user)',
    colorSoft: 'var(--el-user-soft)',
    curve: '第一曲线的起点',
    metaphor: '站稳脚跟再离家',
    rule: { name: '减法', op: '减法', formula: '砍掉与核心需求无关的一切', note: '精益——把复杂的事情简单做。' },
    degree: '市场精度',
    gist: '在一个混沌市场里，用最小的代价验证「谁、为什么、值不值得」。创业不是把一个想法做大，而是把一个假设证伪或证实。',
    core: '单点突破：找一个足够痛的点，做到不可替代。',
    fourQuestions: [
      { q: 'Why · 为什么创业？', a: '找到一个爽痛点需求——不解决就难受，解决了就爽。' },
      { q: 'Who · 和谁创业？', a: '创始人与合伙人的能力互补，构成最初的差异化。' },
      { q: 'What · 创什么业？', a: 'MVP 不是残缺的产品，而是能验证关键假设的最小闭环。' },
      { q: 'Where · 市场环境如何？', a: '用单点突破在混沌中切出一个清晰的秩序。' },
    ],
    points: Object.fromEntries(Object.entries(MATRIX).map(([k, v]) => [k, v[0]])),
    signals: ['产品尚未被市场验证', '用户量小但增速高', '组织高度依赖创始人', '现金流紧张，试错次数有限'],
    risks: ['伪需求：把自嗨当共识', '过早扩张：在没验证前放大投入', '团队同质化：三驾马车缺位'],
    question: '我们是否已经证明了「有人非要不可」？',
  },
  {
    key: 'growth',
    index: 2,
    label: '专益成长',
    short: '成长',
    code: '专',
    span: '从 1 到 N',
    color: 'var(--el-org)',
    colorSoft: 'var(--el-org-soft)',
    curve: '第一曲线的陡升段',
    metaphor: '一路歌来一路发',
    rule: { name: '乘法', op: '乘法', formula: '单一用户价值 × 用户数量', note: '专益——把简单的事情重复做。' },
    degree: '市场深度',
    gist: '需求被验证之后，问题从「能不能活」变成「能不能复制」。成长不是把同一件事做更多遍，而是把偶然的成功变成可重复的系统。',
    core: '专业化：把偶然的成功沉淀为可复制的组织能力。',
    fourQuestions: [
      { q: 'Why · 为什么要成长？', a: '验证过的需求需要被更多人满足，否则会被更快的人抢走。' },
      { q: 'Who · 组织能否跟得上？', a: '从创始人到领导团队，从兄弟连到专业军。' },
      { q: 'What · 成长方向是什么？', a: '把 MVP 打磨成爆款，把单点做成可复制的增长单元。' },
      { q: 'Where · 市场环境如何？', a: '蓝海窗口不会永远开着，速度本身就是壁垒。' },
    ],
    points: Object.fromEntries(Object.entries(MATRIX).map(([k, v]) => [k, v[1]])),
    signals: ['PMF 已初步验证', '复购 / 留存曲线开始走平', '组织人数快速膨胀', '开始出现第一梯队竞争者'],
    risks: ['增长依赖投放：停止投放即停止增长', '管理滞后：人多了，组织没有升级', '过早多元化：主线未稳就开新战场'],
    question: '我们的成功，能否被复制第二次、第一百次？',
  },
  {
    key: 'expansion',
    index: 3,
    label: '增益扩张',
    short: '扩张',
    code: '增',
    span: '从 N 到 N+',
    color: 'var(--el-product)',
    colorSoft: 'var(--el-product-soft)',
    curve: '第一曲线的平台期',
    metaphor: '黄沙百战穿金甲',
    rule: { name: '加法', op: '加法', formula: '用户价值叠加、业务组合叠加', note: '增益——把重复的事情认真做。' },
    degree: '市场宽度',
    gist: '单点做深之后，企业面临「边界」问题：往哪个方向扩、以什么方式扩、扩张的代价由谁承担。扩张的本质是复制能力的半径。',
    core: '增益：让每一次扩张都带来结构性的增量，而不只是摊薄。',
    fourQuestions: [
      { q: 'Why · 为什么要多元化？', a: '主业的空间开始可见，能力与资源需要找到新的出口。' },
      { q: 'Who · 组织能否撑得住？', a: '事业部、平台化、中台化——组织要先于业务完成升级。' },
      { q: 'What · 在什么方面多元化？', a: '围绕核心能力扩张，而不是围绕机会主义扩张。' },
      { q: 'Where · 市场是否支持多元化？', a: '红海之中，范围经济比规模经济更能解释胜负。' },
    ],
    points: Object.fromEntries(Object.entries(MATRIX).map(([k, v]) => [k, v[2]])),
    signals: ['主业增速放缓但现金流充沛', '多业务并行，协同效应待验证', '组织复杂度显著上升', '开始面对跨界竞争者'],
    risks: ['盲目多元化：能力半径之外扩张', '协同幻觉：以为有协同，其实只是并列', '组织失控：分权没有配套的治理'],
    question: '我们要扩张的，是能力半径，还是欲望半径？',
  },
  {
    key: 'transformation',
    index: 4,
    label: '升益转型',
    short: '转型',
    code: '升',
    span: '从 N+ 到 Z',
    color: 'var(--el-market)',
    colorSoft: 'var(--el-market-soft)',
    curve: '第二曲线接管',
    metaphor: '病树前头万木春',
    rule: { name: '除法', op: '除法', formula: '自我颠覆，除旧布新', note: '升益——把认真的事情创新做。' },
    degree: '市场维度',
    gist: '没有永远的第一曲线。转型不是「救火」，而是在第一曲线仍然健康时，主动开启第二曲线。最难的从来不是技术，而是自我否定。',
    core: '升益：在旧曲线仍能造血时，把资源与认知投向新曲线。',
    fourQuestions: [
      { q: 'Why · 为什么要转型？', a: '不是等到下滑才转，而是看到第一条曲线的边界时就开始。' },
      { q: 'Who · 组织能否变得了？', a: '新业务需要新组织，不能寄生在旧组织的考核里。' },
      { q: 'What · 转型的方向是什么？', a: '回到用户与技术的原点，寻找新的价值主张与品类。' },
      { q: 'Where · 转型的市场环境如何？', a: '范式变革期，旧规则失效，新规则未立——这是最大的机会窗口。' },
    ],
    points: Object.fromEntries(Object.entries(MATRIX).map(([k, v]) => [k, v[3]])),
    signals: ['主业增长见顶，或政策 / 技术环境突变', '用户结构老化或迁移', '组织出现明显的路径依赖', '新业务需要与旧业务不同的考核'],
    risks: ['转得太晚：在第一曲线下滑时才启动', '转得太散：同时开多条第二曲线', '组织不换：用旧组织的考核管新业务'],
    question: '如果今天重新创业，我们还会做现在这门生意吗？',
  },
];

/** 5W1H 六问（对应原书：Why→用户，Who→组织，What→产品，Where→市场，When→阶段，How→路径） */
export const SIX_QUESTIONS = [
  { key: 'why', label: 'Why', cn: '为什么存在', maps: '用户要素', mapsEl: 'user', desc: '企业为什么存在？用户为什么买账？为什么创业、为什么扩张、为什么转型。', points: ['needs'] },
  { key: 'who', label: 'Who', cn: '由谁组成', maps: '组织要素', mapsEl: 'org', desc: '谁定方向、谁在执行、谁在协同？企业由什么样的人组成。', points: ['leader', 'team'] },
  { key: 'what', label: 'What', cn: '提供什么', maps: '产品要素', mapsEl: 'product', desc: '企业提供什么产品与服务？核心价值是什么？', points: ['development', 'businessModel'] },
  { key: 'where', label: 'Where', cn: '经营环境', maps: '市场要素', mapsEl: 'market', desc: '在哪个市场、哪个场景、哪个生态位？外部环境正在奖励什么？', points: ['competition', 'tech'] },
  { key: 'when', label: 'When', cn: '何时变革', maps: '四个阶段', mapsEl: null, desc: '企业处在生命周期的哪个阶段？四要素何时发生重要变化？', points: ['capital'] },
  { key: 'how', label: 'How', cn: '如何发展', maps: '四条路径', mapsEl: null, desc: '四要素如何发生重要变化？用户战略、组织战略、产品战略、市场战略如何展开。', points: ['marketing', 'structure', 'choice'] },
];

/** 双 S 曲线：A 曲线（现有业务）+ B 曲线（新业务）= C 曲线（企业价值） */
export const CURVES = {
  a: {
    label: 'A 曲线',
    note: '现有业务的生命周期：萌芽 → 成长 → 稳定 → 衰减。',
    stages: ['创业', '成长', '扩张', '衰退'],
    points: [
      [0.02, 0.05], [0.07, 0.11], [0.14, 0.24], [0.23, 0.45], [0.32, 0.65],
      [0.41, 0.79], [0.50, 0.868], [0.59, 0.905], [0.68, 0.912], [0.77, 0.9],
      [0.86, 0.85], [0.95, 0.76],
    ],
  },
  b: {
    label: 'B 曲线',
    note: '新业务的成长：在第一曲线仍在上升时开启，经历低谷，最终接管增长。',
    stages: ['转型', '新创业', '新成长', '新扩张'],
    points: [
      [0.30, 0.08], [0.37, 0.085], [0.44, 0.11], [0.51, 0.17], [0.58, 0.27],
      [0.65, 0.41], [0.72, 0.57], [0.79, 0.71], [0.86, 0.83], [0.93, 0.92], [0.99, 0.97],
    ],
  },
  window: { from: 0.30, to: 0.62, label: '战略切换窗口' },
};

/** 阶段跃迁的「变与不变」 */
export const TRANSITIONS = [
  {
    from: 'startup', to: 'growth',
    title: '从验证到复制',
    slogan: '把「偶然」变成「系统」',
    changes: [
      ['用户', '天使用户 → 大众用户', '跨越需求鸿沟，从尝鲜者到主流人群'],
      ['组织', '创始人 → 创始人成长', '从个人判断到班子决策'],
      ['产品', 'MVP → 爆款产品', '从能跑通到能击穿'],
      ['市场', '混沌市场 → 蓝海市场', '从无人区到窗口期'],
    ],
    unchanged: '对用户价值的敏锐度不能丢——这是贯穿四阶段的主线。',
  },
  {
    from: 'growth', to: 'expansion',
    title: '从复制到扩展',
    slogan: '把「能力」变成「半径」',
    changes: [
      ['用户', '大众用户 → 累积用户', '用户资产开始复利'],
      ['组织', '层级组织 → 事业部组织', '从效率优先到活力优先'],
      ['产品', '爆款产品 → 关联产品', '从单品致胜到组合协同'],
      ['市场', '蓝海市场 → 红海市场', '从抢窗口到拼效率'],
    ],
    unchanged: '主业的基本盘与现金流，是扩张的底气而非包袱。',
  },
  {
    from: 'expansion', to: 'transformation',
    title: '从扩展到换轨',
    slogan: '把「成功」变成「勇气」',
    changes: [
      ['用户', '累积用户 → 重识用户', '旧人群的天花板，可能是新人群的起点'],
      ['组织', '事业部组织 → 无边界组织', '新业务不能在旧考核里生长'],
      ['产品', '关联产品 → 品类创新', '不是加一个产品，而是换一个赛道'],
      ['市场', '红海市场 → 蓝冰市场', '旧规则融化，新规则未立'],
    ],
    unchanged: '第一曲线的现金流要用来供养第二曲线，而不是用来维持旧叙事。',
  },
];

/** 课前 / 课中 / 课后 教学设计（教学适配，非原书表述） */
export const SESSIONS = {
  pre: {
    key: 'pre',
    title: '课前 · 建立共同语言',
    minutes: 20,
    goal: '在不占用课堂时间的前提下，让每位学员先完成一次自我诊断，带着问题进课堂。',
    steps: [
      { t: '理论地图', d: '通读四要素与四阶段，理解 2×2 的空间定位，记住 12 个要点。', link: '#/theory' },
      { t: '阶段自评', d: '用测评判断自己的企业处在哪个阶段，以及哪个要素最滞后。', link: '#/quiz' },
      { t: '画布初填', d: '在画布中为自己的企业做一次 12 要点评分（约 10 分钟）。', link: '#/canvas' },
      { t: '案例对照', d: '选一个与自身阶段相同的案例，记录一个想在课上提的问题。', link: '#/cases' },
    ],
    deliverable: '一份自动生成的「课前诊断卡」，可在课中直接投屏讨论。',
  },
  in: {
    key: 'in',
    title: '课中 · 结构化研讨',
    minutes: 90,
    goal: '用案例与画布交替推进：先看别人怎么选，再回到自己的企业怎么选。',
    steps: [
      { t: '案例沉浸', d: '选择一个案例的关键抉择，小组内 5 分钟做出选择并说明理由。', link: '#/cases' },
      { t: '画布对照', d: '把案例的四要素演化投射到画布上，观察「要素是否同步」。', link: '#/canvas' },
      { t: '同伴质询', d: '两人一组，用 5W1H 相互追问画布中的薄弱环节。', link: '#/canvas' },
      { t: '诊断校准', d: '用阶段诊断检验「自评阶段」与「要素表现」是否一致。', link: '#/canvas' },
    ],
    deliverable: '每个小组产出一张「共演失衡图」，标注最需要优先修复的要素。',
  },
  post: {
    key: 'post',
    title: '课后 · 行动转化',
    minutes: 30,
    goal: '把课堂认知转化为一个可执行、可复盘的战略动作。',
    steps: [
      { t: '30 天行动', d: '为评分最低的 3 个要点，各写一个 30 天内可验证的动作。', link: '#/workspace' },
      { t: '认知清单', d: '完成全部测评题，回看解析，形成自己的「易错认知清单」。', link: '#/quiz' },
      { t: '月度复盘', d: '一个月后回来更新评分，对比变化，做一次复盘。', link: '#/workspace' },
      { t: '成果导出', d: '把画布导出为图片或 Markdown，提交给班级或学习小组。', link: '#/workspace' },
    ],
    deliverable: '一页纸战略备忘录 + 30 天行动清单 + 月度复盘对比。',
  },
};

/** 常见误读 */
export const MISREADINGS = [
  {
    wrong: '共演战略就是四要素的 SWOT 分析',
    right: '四要素不是并列清单，而是「内与外、人与事」两对张力构成的作用系统。关键不是四项分别多强，而是它们是否同步演化。',
  },
  {
    wrong: '四个阶段是线性顺序，走完就成功',
    right: '阶段可回退、可跳跃、可多业务并存。一家企业可能同时处在「扩张」与「转型」——老业务在扩张，新业务在创业。',
  },
  {
    wrong: '转型是增长见顶之后的补救',
    right: '第二曲线应在第一曲线仍在上行时启动（B 曲线）。等到下滑再转，往往既没有资源，也没有时间。',
  },
  {
    wrong: '12 个要点就是 12 项工作，逐项打勾即可',
    right: '12 个要点是观察窗口，不是任务清单。不同阶段的要点权重不同，取舍比齐全更重要。',
  },
  {
    wrong: '画布就是把企业情况填进 12 个格子',
    right: '画布的价值在「对照」：同一格在四个阶段的名字不同，填完之后要问——我的四要素，是否停在了不同的阶段？',
  },
];

/** 四益法则 */
export const FOUR_RULES = [
  { stage: '精益创业', op: '减法', formula: '砍掉与核心需求无关的一切', note: '把复杂的事情简单做', color: 'var(--el-user)' },
  { stage: '专益成长', op: '乘法', formula: '单一用户价值 × 用户数量', note: '把简单的事情重复做', color: 'var(--el-org)' },
  { stage: '增益扩张', op: '加法', formula: '用户价值叠加、业务组合叠加', note: '把重复的事情认真做', color: 'var(--el-product)' },
  { stage: '升益转型', op: '除法', formula: '自我颠覆，除旧布新', note: '把认真的事情创新做', color: 'var(--el-market)' },
];

/** 四度空间：市场精度的递进 */
export const FOUR_DEGREES = [
  { stage: '创业', degree: '精度', desc: '在一个足够小的场景里，做到足够准。' },
  { stage: '成长', degree: '深度', desc: '在同一场景里，挖得足够深。' },
  { stage: '扩张', degree: '宽度', desc: '把能力横向铺到相邻场景。' },
  { stage: '转型', degree: '维度', desc: '跳出原有坐标，换一个维度看市场。' },
];

/** 延伸：AI 时代四要素的换轨（本工具的教学延伸，非原书内容） */
export const AI_SHIFTS = [
  {
    el: 'user',
    from: '被服务的对象',
    to: '与 AI 协作的价值共创者',
    note: '用户从「选择产品」转向「训练自己的智能体」。需求表达变成对话，用户特征开始被实时刻画——精度提升，隐私与信任成为新的选择门槛。',
  },
  {
    el: 'org',
    from: '层级与流程',
    to: '人机混合的作战单元',
    note: '组织从「管人」转向「管人 + 管智能体」。中层的信息中介价值被压缩，领导者的核心工作变成设定目标、定义边界、校准判断。',
  },
  {
    el: 'product',
    from: '功能交付',
    to: '持续进化的智能服务',
    note: '产品从「版本」变成「持续学习」。商业模式从卖许可转向卖结果，竞争壁垒从功能清单转向数据飞轮与场景深度。',
  },
  {
    el: 'market',
    from: '技术采纳',
    to: '范式重构',
    note: 'AI 同时压缩了四个阶段的时间：验证更快、复制更快、扩张更快、也更早遇到天花板。范式变革不再是一生一次，而是每隔几年一次。',
  },
];

export const GLOSSARY = [
  { term: '共演', en: 'Co-evolution', desc: '企业与用户、组织、产品、市场四要素不是单向决定关系，而是在互动中相互塑造、共同演化。' },
  { term: '爽痛点', en: 'Delight & Pain', desc: '用户愿意付费的两种根本动因：消除痛苦，或获得快乐。' },
  { term: 'MVP', en: 'Minimum Viable Product', desc: '能验证关键假设的最小可行产品，不是功能残缺的产品。' },
  { term: 'PMF', en: 'Product-Market Fit', desc: '产品与市场匹配：用户不仅试用，还持续使用并愿意推荐。' },
  { term: '单位经济模型', en: 'Unit Economics', desc: '单个用户或单笔订单的收入与成本结构，决定增长是否可持续。' },
  { term: '第二曲线', en: 'Second Curve', desc: '在第一曲线见顶前启动的新增长轨迹，往往需要不同的能力与组织。' },
  { term: '单点突破', en: 'Beachhead', desc: '集中资源在一个细分场景做到局部领先，再图扩张。' },
  { term: '人单合一', en: 'RenDanHeYi', desc: '海尔提出的组织模式：每个员工直接对接用户需求，组织平台化、小微化。' },
  { term: '耗散结构', en: 'Dissipative Structure', desc: '开放系统通过持续与外界交换能量，维持远离平衡的有序状态。对应「无边界组织」。' },
];

export const SOURCES = [
  { label: '路江涌《共演战略：重新定义企业生命周期》，机械工业出版社，2018', url: 'https://baike.baidu.com/item/%E5%85%B1%E6%BC%94%E6%88%98%E7%95%A5' },
  { label: '路江涌《共演战略画布》，机械工业出版社，2019', url: 'https://baike.baidu.com/item/%E5%85%B1%E6%BC%94%E6%88%98%E7%95%A5%E7%94%BB%E5%B8%83' },
  { label: '北大光华思想力：《共演战略：中国企业战略创新的探索》', url: 'https://www.gsm.pku.edu.cn/thought_leadership/info/1004/1221.htm' },
  { label: '北大光华：《抓住这 12 大要点，精益创业才有活路》', url: 'https://www.sohu.com/a/231967385_99982005' },
  { label: '北大光华：《组织管理的变与不变》', url: 'https://www.gsm.pku.edu.cn/thought_leadership/info/1007/1283.htm' },
  { label: '路江涌《共演战略观：刷新企业管理操作系统》，机械工业出版社，2023', url: 'https://baike.baidu.com/item/%E5%85%B1%E6%BC%94%E6%88%98%E7%95%A5%E8%A7%82' },
  { label: '方塘智库专访：共演战略与四阶段画布', url: 'https://finance.sina.com.cn/stock/relnews/hk/2019-04-15/doc-ihvhiqax2752422.shtml' },
];

/* ---------- 便捷索引 ---------- */
export const STAGE_KEYS = STAGES.map((st) => st.key);
export const elementByKey = Object.fromEntries(ELEMENTS.map((e) => [e.key, e]));
export const stageByKey = Object.fromEntries(STAGES.map((s) => [s.key, s]));
export const pointByKey = Object.fromEntries(POINTS.map((p) => [p.key, p]));
export const pointsOfElement = (elKey) => POINTS.filter((p) => p.el === elKey);

/** 某个阶段里，某要素的三个要点（含阶段化名称） */
export const stagePoints = (stageKey, elKey) =>
  pointsOfElement(elKey).map((p) => ({
    ...p,
    stageLabel: stageByKey[stageKey].points[p.key].label,
    stageDesc: stageByKey[stageKey].points[p.key].desc,
  }));

/** 48 演化矩阵的扁平数组，便于表格与搜索 */
export const EVOLUTION_MATRIX = POINTS.map((p) => ({
  ...p,
  cells: STAGES.map((s) => ({ stage: s.key, ...s.points[p.key] })),
}));
