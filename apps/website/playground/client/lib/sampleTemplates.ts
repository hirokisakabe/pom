export interface SampleTemplate {
  id: string;
  name: string;
  xml: string;
}

export const SAMPLE_TEMPLATES: SampleTemplate[] = [
  {
    id: "financial-summary",
    name: "決算サマリー",
    xml: `<Theme ink="17211B" paper="F4F0E7" surface="FFFDF8" muted="6F786F" green="1F6B4F" lime="B9E769" coral="F06B52" line="D9D5CB" />
<Slide><VStack w="1280" h="720" padding="40" gap="22" backgroundColor="$paper">
  <HStack w="max" justifyContent="spaceBetween" alignItems="start">
    <VStack gap="5">
      <Text fontSize="11" color="$green" bold="true" letterSpacing="2">FY2026 / Q3 EARNINGS</Text>
      <Text fontSize="30" color="$ink" bold="true">成長投資を続けながら、過去最高益を更新</Text>
      <Text fontSize="12" color="$muted">Aurora Works｜2026年4–12月 連結決算（ダミーデータ）</Text>
    </VStack>
    <VStack gap="4" alignItems="end">
      <Text fontSize="10" color="$muted">通期進捗</Text>
      <Text fontSize="26" color="$green" bold="true">76.4%</Text>
      <Shape shapeType="roundRect" w="116" h="24" fill.color="$lime" color="$ink" fontSize="10" bold="true" borderRadius="999">計画を2.8pt超過</Shape>
    </VStack>
  </HStack>

  <HStack w="max" gap="18" alignItems="stretch">
    <VStack w="31%" padding="24" gap="16" backgroundColor="$ink" borderRadius="18">
      <Text fontSize="11" color="$lime" bold="true">KEY MESSAGE</Text>
      <Text fontSize="24" color="$surface" bold="true" lineHeight="1.35">売上成長より速く、\n利益が伸びた。</Text>
      <Text fontSize="12" color="C5CDC6" lineHeight="1.55">エンタープライズ契約の拡大とクラウド原価の改善により、営業利益率は前年同期比で2.1pt上昇。</Text>
      <HStack justifyContent="spaceBetween" alignItems="end">
        <VStack gap="2">
          <Text fontSize="10" color="98A39B">営業利益率</Text>
          <Text fontSize="34" color="$lime" bold="true">18.6%</Text>
        </VStack>
        <Text fontSize="11" color="$surface" bold="true">+2.1pt YoY</Text>
      </HStack>
    </VStack>

    <VStack w="69%" gap="14">
      <HStack w="max" gap="12">
        <VStack w="max" padding="15" gap="5" backgroundColor="$surface" borderRadius="12" border.color="$line" border.width="1">
          <Text fontSize="10" color="$muted">売上高</Text>
          <Text fontSize="27" color="$ink" bold="true">¥42.8B</Text>
          <Text fontSize="11" color="$green" bold="true">↗ 12.4% YoY</Text>
        </VStack>
        <VStack w="max" padding="15" gap="5" backgroundColor="$surface" borderRadius="12" border.color="$line" border.width="1">
          <Text fontSize="10" color="$muted">営業利益</Text>
          <Text fontSize="27" color="$ink" bold="true">¥7.96B</Text>
          <Text fontSize="11" color="$green" bold="true">↗ 27.1% YoY</Text>
        </VStack>
        <VStack w="max" padding="15" gap="5" backgroundColor="$surface" borderRadius="12" border.color="$line" border.width="1">
          <Text fontSize="10" color="$muted">フリーCF</Text>
          <Text fontSize="27" color="$ink" bold="true">¥5.31B</Text>
          <Text fontSize="11" color="$green" bold="true">↗ 18.8% YoY</Text>
        </VStack>
      </HStack>
      <VStack w="max" padding="16" gap="8" backgroundColor="$surface" borderRadius="14" border.color="$line" border.width="1">
        <HStack justifyContent="spaceBetween" alignItems="center">
          <Text fontSize="13" color="$ink" bold="true">四半期売上と営業利益</Text>
          <Text fontSize="10" color="$muted">単位：十億円</Text>
        </HStack>
        <Chart w="max" h="188" chartType="bar" showLegend="true" chartColors='["1F6B4F","B9E769"]'>
          <ChartSeries name="売上高"><ChartDataPoint label="Q1" value="12.4" /><ChartDataPoint label="Q2" value="13.7" /><ChartDataPoint label="Q3" value="16.7" /></ChartSeries>
          <ChartSeries name="営業利益"><ChartDataPoint label="Q1" value="2.1" /><ChartDataPoint label="Q2" value="2.5" /><ChartDataPoint label="Q3" value="3.36" /></ChartSeries>
        </Chart>
      </VStack>
    </VStack>
  </HStack>

  <HStack w="max" gap="12">
    <VStack w="max" padding="14" gap="6" backgroundColor="E4F0E9" borderLeft.color="$green" borderLeft.width="5">
      <Text fontSize="10" color="$green" bold="true">GROWTH</Text>
      <Text fontSize="13" color="$ink" bold="true">大企業ARR +31%</Text>
      <Text fontSize="10" color="$muted">上位20社の拡張契約が牽引</Text>
    </VStack>
    <VStack w="max" padding="14" gap="6" backgroundColor="FFF1EC" borderLeft.color="$coral" borderLeft.width="5">
      <Text fontSize="10" color="$coral" bold="true">WATCH</Text>
      <Text fontSize="13" color="$ink" bold="true">APAC獲得コスト +8%</Text>
      <Text fontSize="10" color="$muted">代理店立ち上げ費用が一時増</Text>
    </VStack>
    <VStack w="max" padding="14" gap="6" backgroundColor="EEF2D8" borderLeft.color="$lime" borderLeft.width="5">
      <Text fontSize="10" color="$green" bold="true">OUTLOOK</Text>
      <Text fontSize="13" color="$ink" bold="true">通期予想を上方修正</Text>
      <Text fontSize="10" color="$muted">営業利益 ¥10.2B → ¥10.8B</Text>
    </VStack>
  </HStack>
</VStack></Slide>`,
  },
  {
    id: "product-landing",
    name: "プロダクト紹介",
    xml: `<Theme night="17131F" violet="6D4AFF" lilac="C9B8FF" acid="D8FF63" cream="F6F1E8" muted="A9A1B3" />
<Slide><HStack w="1280" h="720" backgroundColor="$night">
  <VStack w="55%" h="max" padding="54" gap="28" justifyContent="spaceBetween">
    <HStack gap="10" alignItems="center">
      <Shape shapeType="roundRect" w="38" h="38" fill.color="$acid" color="$night" fontSize="18" bold="true" borderRadius="10">N</Shape>
      <Text fontSize="16" color="$cream" bold="true" letterSpacing="1">NOVA FLOW</Text>
    </HStack>
    <VStack gap="18">
      <Shape shapeType="roundRect" w="190" h="28" fill.color="292235" border.color="$violet" border.width="1" color="$lilac" fontSize="10" bold="true" borderRadius="999">AI OPERATIONS PLATFORM</Shape>
      <Text fontSize="50" color="$cream" bold="true" lineHeight="1.1">仕事の流れを、\n考えるチームへ。</Text>
      <Text fontSize="16" color="$muted" lineHeight="1.6">依頼・判断・実行・報告をひとつのフローに。\n定型作業はAIに任せ、人は意思決定に集中できます。</Text>
      <HStack gap="12">
        <Shape shapeType="roundRect" w="190" h="50" fill.color="$acid" color="$night" fontSize="14" bold="true" borderRadius="10">無料で試す →</Shape>
        <Shape shapeType="roundRect" w="170" h="50" fill.color="292235" border.color="4A4058" border.width="1" color="$cream" fontSize="14" bold="true" borderRadius="10">デモを見る</Shape>
      </HStack>
    </VStack>
    <HStack gap="28">
      <VStack gap="2"><Text fontSize="23" color="$cream" bold="true">47%</Text><Text fontSize="10" color="$muted">処理時間を削減</Text></VStack>
      <VStack gap="2"><Text fontSize="23" color="$cream" bold="true">3.2×</Text><Text fontSize="10" color="$muted">意思決定を高速化</Text></VStack>
      <VStack gap="2"><Text fontSize="23" color="$cream" bold="true">99.99%</Text><Text fontSize="10" color="$muted">稼働率SLA</Text></VStack>
    </HStack>
  </VStack>

  <VStack w="45%" h="max" padding="44" backgroundGradient="linear-gradient(145deg, #6D4AFF 0%, #3D277A 52%, #17131F 100%)" justifyContent="center">
    <VStack padding="24" gap="18" backgroundColor="F6F1E8" borderRadius="22" shadow.type="outer" shadow.color="0B0710" shadow.opacity="0.3" shadow.blur="28" shadow.offset="12">
      <HStack justifyContent="spaceBetween" alignItems="center">
        <VStack gap="2"><Text fontSize="11" color="746B7C">TODAY'S FLOW</Text><Text fontSize="18" color="$night" bold="true">契約更新オペレーション</Text></VStack>
        <Shape shapeType="roundRect" w="70" h="24" fill.color="E4F2B8" color="42520D" fontSize="9" bold="true" borderRadius="999">ON TRACK</Shape>
      </HStack>
      <VStack gap="10">
        <HStack padding="12" gap="12" alignItems="center" backgroundColor="FFFFFF" borderRadius="12"><Icon name="inbox" size="18" color="$violet" variant="circle-filled" bgColor="EEE9FF" w="36" h="36" /><VStack gap="1" w="max"><Text fontSize="12" color="$night" bold="true">更新対象を検出</Text><Text fontSize="9" color="807789">CRMから12社を自動抽出</Text></VStack><Text fontSize="10" color="$violet" bold="true">DONE</Text></HStack>
        <HStack padding="12" gap="12" alignItems="center" backgroundColor="FFFFFF" borderRadius="12"><Icon name="sparkles" size="18" color="$violet" variant="circle-filled" bgColor="EEE9FF" w="36" h="36" /><VStack gap="1" w="max"><Text fontSize="12" color="$night" bold="true">AIが提案書を作成</Text><Text fontSize="9" color="807789">利用状況から最適プランを提示</Text></VStack><Text fontSize="10" color="$violet" bold="true">8/12</Text></HStack>
        <HStack padding="12" gap="12" alignItems="center" backgroundColor="$acid" borderRadius="12"><Icon name="user-check" size="18" color="$night" variant="circle-filled" bgColor="F1FFB7" w="36" h="36" /><VStack gap="1" w="max"><Text fontSize="12" color="$night" bold="true">担当者が最終承認</Text><Text fontSize="9" color="4D522F">判断が必要な差分だけ確認</Text></VStack><Text fontSize="10" color="$night" bold="true">NOW</Text></HStack>
        <HStack padding="12" gap="12" alignItems="center" backgroundColor="EAE5DC" borderRadius="12"><Icon name="send" size="18" color="82798B" variant="circle-filled" bgColor="F6F1E8" w="36" h="36" /><VStack gap="1" w="max"><Text fontSize="12" color="736B7A" bold="true">顧客へ送付・記録</Text><Text fontSize="9" color="908897">承認後にメールとCRMを更新</Text></VStack><Text fontSize="10" color="908897">NEXT</Text></HStack>
      </VStack>
      <HStack justifyContent="spaceBetween" alignItems="center"><Text fontSize="10" color="807789">自動化率</Text><Text fontSize="20" color="$violet" bold="true">82%</Text></HStack>
    </VStack>
  </VStack>
</HStack></Slide>`,
  },
  {
    id: "pricing-plan",
    name: "料金プラン",
    xml: `<Theme navy="10233F" blue="2D68FF" sky="DCE8FF" orange="FF7A45" cream="F7F4ED" ink="162033" muted="697386" line="DDE1E8" />
<Slide><VStack w="1280" h="720" padding.top="36" padding.bottom="32" padding.left="46" padding.right="46" gap="22" backgroundColor="$cream">
  <HStack w="max" justifyContent="spaceBetween" alignItems="end">
    <VStack gap="6">
      <Text fontSize="11" color="$blue" bold="true" letterSpacing="2">PLANS &amp; PRICING</Text>
      <Text fontSize="34" color="$ink" bold="true">チームの成長に、ちょうどいい選択肢。</Text>
      <Text fontSize="12" color="$muted">初期費用なし・14日間無料・いつでもプラン変更可能</Text>
    </VStack>
    <Shape shapeType="roundRect" w="220" h="34" fill.color="$sky" color="$navy" fontSize="11" bold="true" borderRadius="999">年間契約なら 2ヶ月分お得</Shape>
  </HStack>

  <HStack w="max" h="500" gap="16" alignItems="stretch">
    <VStack w="30%" padding="24" gap="18" backgroundColor="FFFDFC" border.color="$line" border.width="1" borderRadius="18">
      <HStack justifyContent="spaceBetween" alignItems="center"><Icon name="sprout" size="20" color="$navy" variant="circle-filled" bgColor="$sky" w="42" h="42" /><Text fontSize="10" color="$muted">FOR SMALL TEAMS</Text></HStack>
      <VStack gap="5"><Text fontSize="22" color="$ink" bold="true">Starter</Text><Text fontSize="12" color="$muted">まず業務を整えたいチームへ</Text></VStack>
      <HStack gap="4" alignItems="end"><Text fontSize="38" color="$ink" bold="true">¥0</Text><Text fontSize="11" color="$muted">/ 月</Text></HStack>
      <VStack gap="12">
        <Text fontSize="12" color="$ink">✓ 3ワークフローまで</Text><Text fontSize="12" color="$ink">✓ 月100回のAI実行</Text><Text fontSize="12" color="$ink">✓ 基本レポート</Text><Text fontSize="12" color="$muted">— 権限管理・SSO</Text>
      </VStack>
      <Shape shapeType="roundRect" w="max" h="46" fill.color="EEF0F3" color="$ink" fontSize="13" bold="true" borderRadius="10">無料で始める</Shape>
    </VStack>

    <VStack w="40%" padding="26" gap="18" backgroundColor="$navy" borderRadius="20" shadow.type="outer" shadow.color="$navy" shadow.opacity="0.22" shadow.blur="24" shadow.offset="10">
      <HStack justifyContent="spaceBetween" alignItems="center"><Icon name="rocket" size="20" color="$navy" variant="circle-filled" bgColor="FFFFFF" w="42" h="42" /><Shape shapeType="roundRect" w="98" h="26" fill.color="$orange" color="FFFFFF" fontSize="10" bold="true" borderRadius="999">MOST POPULAR</Shape></HStack>
      <VStack gap="5"><Text fontSize="24" color="FFFFFF" bold="true">Growth</Text><Text fontSize="12" color="B9C7DA">複数部門で成果を広げたい企業へ</Text></VStack>
      <HStack gap="4" alignItems="end"><Text fontSize="42" color="FFFFFF" bold="true">¥4,800</Text><Text fontSize="11" color="B9C7DA">/ ユーザー / 月</Text></HStack>
      <HStack gap="28">
        <VStack gap="12" w="max"><Text fontSize="12" color="FFFFFF">✓ ワークフロー無制限</Text><Text fontSize="12" color="FFFFFF">✓ AI実行 10,000回/月</Text><Text fontSize="12" color="FFFFFF">✓ 高度な分析</Text></VStack>
        <VStack gap="12" w="max"><Text fontSize="12" color="FFFFFF">✓ 権限・承認フロー</Text><Text fontSize="12" color="FFFFFF">✓ API連携</Text><Text fontSize="12" color="FFFFFF">✓ 優先サポート</Text></VStack>
      </HStack>
      <Shape shapeType="roundRect" w="max" h="48" fill.color="FFFFFF" color="$navy" fontSize="14" bold="true" borderRadius="10">14日間無料で試す →</Shape>
    </VStack>

    <VStack w="30%" padding="24" gap="18" backgroundColor="FFFDFC" border.color="$line" border.width="1" borderRadius="18">
      <HStack justifyContent="spaceBetween" alignItems="center"><Icon name="building-2" size="20" color="$orange" variant="circle-filled" bgColor="FFF0E8" w="42" h="42" /><Text fontSize="10" color="$muted">FOR ENTERPRISE</Text></HStack>
      <VStack gap="5"><Text fontSize="22" color="$ink" bold="true">Scale</Text><Text fontSize="12" color="$muted">統制と拡張性が必要な組織へ</Text></VStack>
      <Text fontSize="29" color="$ink" bold="true">個別見積り</Text>
      <VStack gap="12"><Text fontSize="12" color="$ink">✓ SSO / SCIM</Text><Text fontSize="12" color="$ink">✓ 専用環境・監査ログ</Text><Text fontSize="12" color="$ink">✓ SLA 99.99%</Text><Text fontSize="12" color="$ink">✓ 専任CSM</Text></VStack>
      <Shape shapeType="roundRect" w="max" h="46" fill.color="$orange" color="FFFFFF" fontSize="13" bold="true" borderRadius="10">相談する</Shape>
    </VStack>
  </HStack>
  <Text fontSize="10" color="$muted" textAlign="center">すべてのプランにセキュアなデータ暗号化、国内リージョン、メールサポートが含まれます。</Text>
</VStack></Slide>`,
  },
  {
    id: "chart-showcase",
    name: "チャート集",
    xml: `<Theme bg="EEF2F1" ink="132522" forest="184D43" mint="72D6B5" yellow="F2C14E" red="E66B5B" surface="FFFFFF" muted="6F7D79" line="D7E0DD" />
<Slide><VStack w="1280" h="720" padding="32" gap="16" backgroundColor="$bg">
  <HStack w="max" justifyContent="spaceBetween" alignItems="center">
    <VStack gap="3"><Text fontSize="11" color="$forest" bold="true" letterSpacing="2">SIGNAL ROOM / WEEK 24</Text><Text fontSize="27" color="$ink" bold="true">数字を並べるのではなく、変化を読む。</Text></VStack>
    <HStack gap="8" alignItems="center"><Shape shapeType="ellipse" w="8" h="8" fill.color="$mint" /><Text fontSize="11" color="$muted">Data refreshed 09:00</Text></HStack>
  </HStack>
  <HStack w="max" gap="14" alignItems="stretch">
    <VStack w="62%" padding="18" gap="10" backgroundColor="$surface" borderRadius="16" border.color="$line" border.width="1">
      <HStack justifyContent="spaceBetween" alignItems="start"><VStack gap="2"><Text fontSize="12" color="$muted">NET REVENUE</Text><Text fontSize="28" color="$ink" bold="true">¥86.4M <Span fontSize="13">/ week</Span></Text></VStack><Shape shapeType="roundRect" w="104" h="26" fill.color="DFF5EC" color="$forest" fontSize="10" bold="true" borderRadius="999">+18.2% YoY</Shape></HStack>
      <Chart w="max" h="205" chartType="area" showLegend="true" chartColors='["184D43","72D6B5"]'>
        <ChartSeries name="実績"><ChartDataPoint label="W19" value="62" /><ChartDataPoint label="W20" value="66" /><ChartDataPoint label="W21" value="64" /><ChartDataPoint label="W22" value="75" /><ChartDataPoint label="W23" value="79" /><ChartDataPoint label="W24" value="86.4" /></ChartSeries>
        <ChartSeries name="計画"><ChartDataPoint label="W19" value="60" /><ChartDataPoint label="W20" value="63" /><ChartDataPoint label="W21" value="67" /><ChartDataPoint label="W22" value="70" /><ChartDataPoint label="W23" value="74" /><ChartDataPoint label="W24" value="78" /></ChartSeries>
      </Chart>
      <Text fontSize="11" color="$forest" bold="true">↗ W22以降、エンタープライズの追加受注で計画線を上抜け</Text>
    </VStack>
    <VStack w="38%" padding="18" gap="10" backgroundColor="$ink" borderRadius="16">
      <Text fontSize="12" color="$mint" bold="true">REVENUE MIX</Text>
      <Chart w="max" h="188" chartType="doughnut" showLegend="true" chartColors='["72D6B5","F2C14E","E66B5B","6F7D79"]'><ChartSeries name="売上構成"><ChartDataPoint label="Enterprise" value="48" /><ChartDataPoint label="Growth" value="31" /><ChartDataPoint label="Starter" value="14" /><ChartDataPoint label="Services" value="7" /></ChartSeries></Chart>
      <HStack justifyContent="spaceBetween"><VStack gap="2"><Text fontSize="10" color="9FB0AC">最大セグメント</Text><Text fontSize="17" color="FFFFFF" bold="true">Enterprise 48%</Text></VStack><VStack gap="2" alignItems="end"><Text fontSize="10" color="9FB0AC">前期比</Text><Text fontSize="17" color="$mint" bold="true">+6pt</Text></VStack></HStack>
    </VStack>
  </HStack>
  <HStack w="max" gap="14" alignItems="stretch">
    <VStack w="34%" padding="16" gap="8" backgroundColor="$surface" borderRadius="14" border.color="$line" border.width="1"><Text fontSize="12" color="$ink" bold="true">獲得チャネル効率</Text><Chart w="max" h="155" chartType="bar" showLegend="false" chartColors='["184D43"]'><ChartSeries name="商談化率"><ChartDataPoint label="紹介" value="42" /><ChartDataPoint label="イベント" value="31" /><ChartDataPoint label="検索" value="24" /><ChartDataPoint label="広告" value="16" /></ChartSeries></Chart></VStack>
    <VStack w="34%" padding="16" gap="8" backgroundColor="$surface" borderRadius="14" border.color="$line" border.width="1"><Text fontSize="12" color="$ink" bold="true">顧客満足の構造</Text><Chart w="max" h="155" chartType="radar" showLegend="false" chartColors='["72D6B5"]'><ChartSeries name="評価"><ChartDataPoint label="価値" value="91" /><ChartDataPoint label="使いやすさ" value="78" /><ChartDataPoint label="速度" value="84" /><ChartDataPoint label="支援" value="88" /><ChartDataPoint label="連携" value="72" /></ChartSeries></Chart></VStack>
    <VStack w="32%" padding="18" gap="11" backgroundColor="FFF8E7" borderRadius="14" border.color="E8D8A8" border.width="1"><Text fontSize="10" color="8B6B13" bold="true">ANALYST NOTE</Text><Text fontSize="18" color="$ink" bold="true" lineHeight="1.35">成長の質は改善。\n次の制約は連携性。</Text><Text fontSize="11" color="$muted" lineHeight="1.5">紹介チャネルの効率と顧客支援は強い。一方、外部連携の評価が72に留まり、Enterprise拡大のボトルネックになり得る。</Text><Shape shapeType="roundRect" w="max" h="30" fill.color="$yellow" color="$ink" fontSize="10" bold="true" borderRadius="8">NEXT → API連携を優先</Shape></VStack>
  </HStack>
</VStack></Slide>`,
  },
  {
    id: "project-dashboard",
    name: "プロジェクト管理ダッシュボード",
    xml: `<Theme bg="F5F7FA" ink="172033" blue="3157D5" cyan="5FD1E8" green="2BAA76" amber="E8A33A" red="D9544D" surface="FFFFFF" muted="718096" line="DDE3EC" />
<Slide><VStack w="1280" h="720" padding="30" gap="15" backgroundColor="$bg">
  <HStack w="max" justifyContent="spaceBetween" alignItems="center">
    <HStack gap="12" alignItems="center"><Icon name="layers-3" size="22" color="FFFFFF" variant="square-filled" bgColor="$blue" w="44" h="44" /><VStack gap="2"><Text fontSize="24" color="$ink" bold="true">Atlas Renewal</Text><Text fontSize="11" color="$muted">基幹システム刷新｜Executive Delivery View</Text></VStack></HStack>
    <HStack gap="8"><Shape shapeType="roundRect" w="102" h="26" fill.color="E1F5EC" color="$green" fontSize="10" bold="true" borderRadius="999">● ON TRACK</Shape><Shape shapeType="roundRect" w="140" h="26" fill.color="E9EEFF" color="$blue" fontSize="10" bold="true" borderRadius="999">Sprint 14 / 18</Shape></HStack>
  </HStack>
  <HStack w="max" gap="12">
    <VStack w="max" padding="14" gap="4" backgroundColor="$surface" borderRadius="12" border.color="$line" border.width="1"><Text fontSize="9" color="$muted">OVERALL PROGRESS</Text><Text fontSize="25" color="$ink" bold="true">72%</Text><Text fontSize="10" color="$green" bold="true">+6pt this sprint</Text></VStack>
    <VStack w="max" padding="14" gap="4" backgroundColor="$surface" borderRadius="12" border.color="$line" border.width="1"><Text fontSize="9" color="$muted">BUDGET USED</Text><Text fontSize="25" color="$ink" bold="true">¥184M</Text><Text fontSize="10" color="$muted">of ¥260M</Text></VStack>
    <VStack w="max" padding="14" gap="4" backgroundColor="$surface" borderRadius="12" border.color="$line" border.width="1"><Text fontSize="9" color="$muted">OPEN RISKS</Text><Text fontSize="25" color="$amber" bold="true">4</Text><Text fontSize="10" color="$red">1 high priority</Text></VStack>
    <VStack w="max" padding="14" gap="4" backgroundColor="$surface" borderRadius="12" border.color="$line" border.width="1"><Text fontSize="9" color="$muted">GO-LIVE</Text><Text fontSize="25" color="$ink" bold="true">18 Sep</Text><Text fontSize="10" color="$green" bold="true">forecast unchanged</Text></VStack>
  </HStack>
  <HStack w="max" gap="14" alignItems="stretch">
    <VStack w="64%" gap="12">
      <VStack w="max" padding="16" gap="10" backgroundColor="$surface" borderRadius="14" border.color="$line" border.width="1"><HStack justifyContent="spaceBetween"><Text fontSize="13" color="$ink" bold="true">Delivery burn-up</Text><Text fontSize="10" color="$muted">Scope 184 pts</Text></HStack><Chart w="max" h="190" chartType="line" showLegend="true" chartColors='["3157D5","5FD1E8"]'><ChartSeries name="完了"><ChartDataPoint label="S9" value="78" /><ChartDataPoint label="S10" value="91" /><ChartDataPoint label="S11" value="106" /><ChartDataPoint label="S12" value="121" /><ChartDataPoint label="S13" value="132" /><ChartDataPoint label="S14" value="148" /></ChartSeries><ChartSeries name="計画"><ChartDataPoint label="S9" value="82" /><ChartDataPoint label="S10" value="96" /><ChartDataPoint label="S11" value="110" /><ChartDataPoint label="S12" value="124" /><ChartDataPoint label="S13" value="138" /><ChartDataPoint label="S14" value="152" /></ChartSeries></Chart></VStack>
      <VStack w="max" padding="16" gap="10" backgroundColor="$surface" borderRadius="14" border.color="$line" border.width="1"><HStack justifyContent="spaceBetween"><Text fontSize="13" color="$ink" bold="true">Release path</Text><Text fontSize="10" color="$muted">Critical path highlighted</Text></HStack><ProcessArrow w="max" h="62" direction="horizontal" fontSize="11" bold="true"><ProcessArrowStep label="Design freeze" color="AFC0F5" textColor="172033" /><ProcessArrowStep label="Build" color="6E8DE8" textColor="FFFFFF" /><ProcessArrowStep label="UAT" color="3157D5" textColor="FFFFFF" /><ProcessArrowStep label="Migration" color="E8A33A" textColor="FFFFFF" /><ProcessArrowStep label="Go-live" color="2BAA76" textColor="FFFFFF" /></ProcessArrow></VStack>
    </VStack>
    <VStack w="36%" gap="12">
      <VStack w="max" padding="16" gap="12" backgroundColor="$ink" borderRadius="14"><HStack justifyContent="spaceBetween"><Text fontSize="13" color="FFFFFF" bold="true">Decision queue</Text><Shape shapeType="roundRect" w="54" h="22" fill.color="$red" color="FFFFFF" fontSize="9" bold="true" borderRadius="999">3 OPEN</Shape></HStack><VStack gap="9"><VStack padding="11" gap="3" backgroundColor="273249" borderLeft.color="$red" borderLeft.width="4"><Text fontSize="11" color="FFFFFF" bold="true">データ移行の停止時間</Text><Text fontSize="9" color="AEB8C9">本日｜SteerCo判断が必要</Text></VStack><VStack padding="11" gap="3" backgroundColor="273249" borderLeft.color="$amber" borderLeft.width="4"><Text fontSize="11" color="FFFFFF" bold="true">UAT追加要員 +4名</Text><Text fontSize="9" color="AEB8C9">木曜まで｜予算影響 ¥3.2M</Text></VStack><VStack padding="11" gap="3" backgroundColor="273249" borderLeft.color="$cyan" borderLeft.width="4"><Text fontSize="11" color="FFFFFF" bold="true">旧帳票12本の廃止</Text><Text fontSize="9" color="AEB8C9">来週｜業務部門と最終確認</Text></VStack></VStack></VStack>
      <VStack w="max" padding="16" gap="9" backgroundColor="$surface" borderRadius="14" border.color="$line" border.width="1"><Text fontSize="13" color="$ink" bold="true">This week</Text><HStack justifyContent="spaceBetween"><Text fontSize="10" color="$muted">設計レビュー</Text><Text fontSize="10" color="$green" bold="true">24 / 24</Text></HStack><HStack justifyContent="spaceBetween"><Text fontSize="10" color="$muted">テストケース</Text><Text fontSize="10" color="$blue" bold="true">186 / 240</Text></HStack><HStack justifyContent="spaceBetween"><Text fontSize="10" color="$muted">重大障害</Text><Text fontSize="10" color="$green" bold="true">0 open</Text></HStack></VStack>
    </VStack>
  </HStack>
</VStack></Slide>`,
  },
  {
    id: "strategy-analysis",
    name: "経営戦略分析",
    xml: `<Theme paper="F3EEE4" ink="25231F" burgundy="7E2F45" rose="D99AA9" sage="8EA38C" gold="C79B43" surface="FFFCF6" muted="756F66" line="DED5C7" />
<Slide><VStack w="1280" h="720" padding="38" gap="18" backgroundColor="$paper">
  <HStack w="max" justifyContent="spaceBetween" alignItems="end"><VStack gap="5"><Text fontSize="11" color="$burgundy" bold="true" letterSpacing="2">FY2027 STRATEGY / ONE-PAGE CHOICE</Text><Text fontSize="31" color="$ink" bold="true">広く獲るより、深く勝つ。</Text><Text fontSize="12" color="$muted">中堅製造業に集中し、プロダクトと販売モデルを再設計する</Text></VStack><Text fontSize="10" color="$muted">Strategy Office｜July 2026</Text></HStack>
  <HStack w="max" gap="16" alignItems="stretch">
    <VStack w="31%" padding="22" gap="17" backgroundColor="$burgundy" borderRadius="16">
      <Text fontSize="10" color="F1C7D2" bold="true">THE CHOICE</Text>
      <Text fontSize="24" color="FFFFFF" bold="true" lineHeight="1.35">売上100–500億円の\n製造業に集中する。</Text>
      <Text fontSize="11" color="F0DCE1" lineHeight="1.55">標準機能の追加競争から離れ、「現場データの統合」と「定着支援」をセットで提供。高い継続率と単価を狙う。</Text>
      <VStack gap="10"><HStack justifyContent="spaceBetween"><Text fontSize="10" color="F1C7D2">Target ARR</Text><Text fontSize="15" color="FFFFFF" bold="true">¥12.0B</Text></HStack><HStack justifyContent="spaceBetween"><Text fontSize="10" color="F1C7D2">Target NRR</Text><Text fontSize="15" color="FFFFFF" bold="true">125%</Text></HStack><HStack justifyContent="spaceBetween"><Text fontSize="10" color="F1C7D2">Payback</Text><Text fontSize="15" color="FFFFFF" bold="true">&lt; 14 mo</Text></HStack></VStack>
    </VStack>
    <VStack w="69%" padding="18" gap="10" backgroundColor="$surface" borderRadius="16" border.color="$line" border.width="1">
      <HStack justifyContent="spaceBetween"><Text fontSize="13" color="$ink" bold="true">戦略オプション評価</Text><Text fontSize="10" color="$muted">Impact × Right to win</Text></HStack>
      <Matrix w="max" h="320" axisLabelColor="$muted" quadrantLabelColor="$muted" itemLabelColor="$ink"><MatrixAxes x="勝ち筋の強さ" y="経済インパクト" /><MatrixQuadrants topLeft="提携で補完" topRight="集中投資" bottomLeft="見送り" bottomRight="効率化" /><MatrixItem label="中堅製造業" x="0.82" y="0.86" color="$burgundy" textColor="FFFFFF" /><MatrixItem label="大企業横展開" x="0.48" y="0.79" color="$gold" /><MatrixItem label="海外SMB" x="0.28" y="0.62" color="$rose" /><MatrixItem label="汎用AI機能" x="0.64" y="0.42" color="$sage" /><MatrixItem label="個人市場" x="0.24" y="0.23" color="B8B1A5" /></Matrix>
      <Text fontSize="11" color="$burgundy" bold="true">結論：中堅製造業は市場魅力度と既存資産の適合が唯一ともに高い</Text>
    </VStack>
  </HStack>
  <HStack w="max" gap="12">
    <VStack w="max" padding="15" gap="7" backgroundColor="$surface" borderTop.color="$burgundy" borderTop.width="4"><Text fontSize="10" color="$burgundy" bold="true">01 / PRODUCT</Text><Text fontSize="14" color="$ink" bold="true">現場データ統合を核に</Text><Text fontSize="10" color="$muted" lineHeight="1.45">設備・品質・原価をひとつの意思決定画面へ。</Text></VStack>
    <VStack w="max" padding="15" gap="7" backgroundColor="$surface" borderTop.color="$gold" borderTop.width="4"><Text fontSize="10" color="936E27" bold="true">02 / GO-TO-MARKET</Text><Text fontSize="14" color="$ink" bold="true">業界別の勝ち方を型化</Text><Text fontSize="10" color="$muted" lineHeight="1.45">3業種に絞った導入テンプレートと事例を整備。</Text></VStack>
    <VStack w="max" padding="15" gap="7" backgroundColor="$surface" borderTop.color="$sage" borderTop.width="4"><Text fontSize="10" color="5E775D" bold="true">03 / DELIVERY</Text><Text fontSize="14" color="$ink" bold="true">定着までを商品にする</Text><Text fontSize="10" color="$muted" lineHeight="1.45">90日間の伴走プログラムで利用部門を拡張。</Text></VStack>
    <VStack w="max" padding="15" gap="7" backgroundColor="E9DFD2" borderTop.color="$ink" borderTop.width="4"><Text fontSize="10" color="$ink" bold="true">NOT DOING</Text><Text fontSize="14" color="$ink" bold="true">機能数で競わない</Text><Text fontSize="10" color="$muted" lineHeight="1.45">低単価SMBと個別受託は投資対象から外す。</Text></VStack>
  </HStack>
</VStack></Slide>`,
  },
  {
    id: "saas-kpi",
    name: "SaaS KPIダッシュボード",
    xml: `<Theme night="071B18" panel="102925" panel2="15342F" mint="71E6B8" aqua="5BC8D8" yellow="F5D66F" coral="FF806B" text="F1F8F5" muted="8AA39D" />
<Slide><VStack w="1280" h="720" padding="30" gap="14" backgroundGradient="linear-gradient(135deg, #071B18 0%, #0D2924 100%)">
  <HStack w="max" justifyContent="spaceBetween" alignItems="center"><HStack gap="11" alignItems="center"><Icon name="activity" size="20" color="$night" variant="square-filled" bgColor="$mint" w="42" h="42" /><VStack gap="2"><Text fontSize="23" color="$text" bold="true">Northstar SaaS Metrics</Text><Text fontSize="10" color="$muted">Board view / June 2026</Text></VStack></HStack><HStack gap="8" alignItems="center"><Shape shapeType="ellipse" w="8" h="8" fill.color="$mint" /><Text fontSize="10" color="$muted">Updated 09:00 JST</Text></HStack></HStack>
  <HStack w="max" gap="11">
    <VStack w="max" padding="14" gap="5" backgroundColor="$panel" borderRadius="11" border.color="21433D" border.width="1"><Text fontSize="9" color="$muted">ARR</Text><Text fontSize="25" color="$text" bold="true">¥1.24B</Text><Text fontSize="10" color="$mint" bold="true">▲ 28% YoY</Text></VStack>
    <VStack w="max" padding="14" gap="5" backgroundColor="$panel" borderRadius="11" border.color="21433D" border.width="1"><Text fontSize="9" color="$muted">NET NEW ARR</Text><Text fontSize="25" color="$text" bold="true">¥84M</Text><Text fontSize="10" color="$aqua" bold="true">▲ 12% vs plan</Text></VStack>
    <VStack w="max" padding="14" gap="5" backgroundColor="$panel" borderRadius="11" border.color="21433D" border.width="1"><Text fontSize="9" color="$muted">NRR</Text><Text fontSize="25" color="$text" bold="true">121%</Text><Text fontSize="10" color="$mint" bold="true">▲ 4pt QoQ</Text></VStack>
    <VStack w="max" padding="14" gap="5" backgroundColor="$panel" borderRadius="11" border.color="21433D" border.width="1"><Text fontSize="9" color="$muted">GROSS CHURN</Text><Text fontSize="25" color="$text" bold="true">1.6%</Text><Text fontSize="10" color="$mint" bold="true">▼ 0.5pt QoQ</Text></VStack>
    <VStack w="max" padding="14" gap="5" backgroundColor="$panel" borderRadius="11" border.color="21433D" border.width="1"><Text fontSize="9" color="$muted">BURN MULTIPLE</Text><Text fontSize="25" color="$text" bold="true">1.2×</Text><Text fontSize="10" color="$yellow" bold="true">target &lt; 1.0×</Text></VStack>
  </HStack>
  <HStack w="max" gap="13" alignItems="stretch">
    <VStack w="66%" padding="16" gap="9" backgroundColor="$panel" borderRadius="13" border.color="21433D" border.width="1"><HStack justifyContent="spaceBetween"><VStack gap="2"><Text fontSize="12" color="$text" bold="true">ARR momentum</Text><Text fontSize="9" color="$muted">Expansion is now the primary growth engine</Text></VStack><Shape shapeType="roundRect" w="110" h="24" fill.color="183D35" color="$mint" fontSize="9" bold="true" borderRadius="999">PLAN +¥32M</Shape></HStack><Chart w="max" h="212" chartType="area" showLegend="true" chartColors='["71E6B8","5BC8D8"]'><ChartSeries name="ARR"><ChartDataPoint label="Jan" value="880" /><ChartDataPoint label="Feb" value="928" /><ChartDataPoint label="Mar" value="986" /><ChartDataPoint label="Apr" value="1054" /><ChartDataPoint label="May" value="1156" /><ChartDataPoint label="Jun" value="1240" /></ChartSeries><ChartSeries name="Plan"><ChartDataPoint label="Jan" value="900" /><ChartDataPoint label="Feb" value="950" /><ChartDataPoint label="Mar" value="1000" /><ChartDataPoint label="Apr" value="1060" /><ChartDataPoint label="May" value="1130" /><ChartDataPoint label="Jun" value="1208" /></ChartSeries></Chart></VStack>
    <VStack w="34%" padding="17" gap="12" backgroundColor="$panel2" borderRadius="13" border.color="285047" border.width="1"><Text fontSize="10" color="$mint" bold="true">BOARD TAKEAWAY</Text><Text fontSize="21" color="$text" bold="true" lineHeight="1.35">成長は健全。\n課題は投資効率。</Text><Text fontSize="10" color="$muted" lineHeight="1.5">NRRと解約率は目標を上回る一方、採用先行でBurn Multipleは1.2×。下期は新規採用より営業生産性を優先する。</Text><VStack gap="8" padding.top="8"><HStack justifyContent="spaceBetween"><Text fontSize="10" color="$muted">Pipeline coverage</Text><Text fontSize="12" color="$mint" bold="true">3.4×</Text></HStack><HStack justifyContent="spaceBetween"><Text fontSize="10" color="$muted">CAC payback</Text><Text fontSize="12" color="$yellow" bold="true">15 mo</Text></HStack><HStack justifyContent="spaceBetween"><Text fontSize="10" color="$muted">Rule of 40</Text><Text fontSize="12" color="$mint" bold="true">46</Text></HStack></VStack></VStack>
  </HStack>
  <HStack w="max" gap="13">
    <VStack w="45%" padding="14" gap="8" backgroundColor="$panel" borderRadius="12"><Text fontSize="11" color="$text" bold="true">ARR bridge / June</Text><Chart w="max" h="120" chartType="bar" showLegend="false" chartColors='["5BC8D8"]'><ChartSeries name="ARR"><ChartDataPoint label="Opening" value="1156" /><ChartDataPoint label="New" value="42" /><ChartDataPoint label="Expansion" value="61" /><ChartDataPoint label="Churn" value="-19" /><ChartDataPoint label="Closing" value="1240" /></ChartSeries></Chart></VStack>
    <VStack w="55%" padding="14" gap="9" backgroundColor="$panel" borderRadius="12"><HStack justifyContent="spaceBetween"><Text fontSize="11" color="$text" bold="true">Focus for next 30 days</Text><Text fontSize="9" color="$muted">OWNER / OUTCOME</Text></HStack><HStack gap="8"><VStack w="max" padding="10" gap="4" backgroundColor="$panel2" borderLeft.color="$mint" borderLeft.width="3"><Text fontSize="10" color="$text" bold="true">Enterprise expansion</Text><Text fontSize="9" color="$muted">CS｜+¥28M pipeline</Text></VStack><VStack w="max" padding="10" gap="4" backgroundColor="$panel2" borderLeft.color="$yellow" borderLeft.width="3"><Text fontSize="10" color="$text" bold="true">Ramp productivity</Text><Text fontSize="9" color="$muted">Sales｜-12% ramp time</Text></VStack><VStack w="max" padding="10" gap="4" backgroundColor="$panel2" borderLeft.color="$aqua" borderLeft.width="3"><Text fontSize="10" color="$text" bold="true">API adoption</Text><Text fontSize="9" color="$muted">Product｜40% active</Text></VStack></HStack></VStack>
  </HStack>
</VStack></Slide>`,
  },
  {
    id: "dx-roadmap",
    name: "DX推進ロードマップ",
    xml: `<Theme ink="192235" navy="253B67" blue="4F7CFF" cyan="69D2E7" violet="8967D8" orange="F1A24A" paper="F5F3EE" surface="FFFFFF" muted="6D7687" line="DCE1E8" />
<Slide><VStack w="1280" h="720" padding="36" gap="18" backgroundColor="$paper">
  <HStack w="max" justifyContent="spaceBetween" alignItems="end"><VStack gap="5"><Text fontSize="11" color="$blue" bold="true" letterSpacing="2">TRANSFORMATION HORIZON / 2026–2029</Text><Text fontSize="31" color="$ink" bold="true">点のデジタル化から、学習する事業へ。</Text><Text fontSize="12" color="$muted">顧客・業務・経営データをつなぎ、3年で意思決定速度を2倍にする</Text></VStack><Shape shapeType="roundRect" w="154" h="30" fill.color="E7ECFF" color="$navy" fontSize="10" bold="true" borderRadius="999">North Star: 2× SPEED</Shape></HStack>
  <VStack w="max" padding="20" gap="15" backgroundColor="$surface" borderRadius="16" border.color="$line" border.width="1">
    <HStack w="max" justifyContent="spaceBetween" alignItems="center"><Text fontSize="12" color="$ink" bold="true">3 horizons</Text><Text fontSize="10" color="$muted">基盤 → 変革 → 自律化</Text></HStack>
    <ProcessArrow w="max" h="66" direction="horizontal" fontSize="11" bold="true"><ProcessArrowStep label="H1｜CONNECT\nデータをつなぐ" color="B9C8F7" textColor="192235" /><ProcessArrowStep label="H2｜REDESIGN\n仕事を変える" color="4F7CFF" textColor="FFFFFF" /><ProcessArrowStep label="H3｜AUTONOMIZE\n事業が学習する" color="253B67" textColor="FFFFFF" /></ProcessArrow>
    <HStack w="max" gap="12">
      <VStack w="max" padding="13" gap="5" backgroundColor="F0F3FD" borderTop.color="$blue" borderTop.width="4"><Text fontSize="10" color="$blue" bold="true">2026 / FOUNDATION</Text><Text fontSize="13" color="$ink" bold="true">顧客・商品データを統合</Text><Text fontSize="10" color="$muted">共通ID、データ品質、クラウド基盤</Text></VStack>
      <VStack w="max" padding="13" gap="5" backgroundColor="EEF9FB" borderTop.color="$cyan" borderTop.width="4"><Text fontSize="10" color="2B8DA0" bold="true">2027 / SCALE</Text><Text fontSize="13" color="$ink" bold="true">主要業務を再設計</Text><Text fontSize="10" color="$muted">営業・需給・保守をエンドツーエンド化</Text></VStack>
      <VStack w="max" padding="13" gap="5" backgroundColor="F2EFFB" borderTop.color="$violet" borderTop.width="4"><Text fontSize="10" color="$violet" bold="true">2028 / INTELLIGENCE</Text><Text fontSize="13" color="$ink" bold="true">予測を意思決定に埋め込む</Text><Text fontSize="10" color="$muted">需要予測、解約予兆、動的価格</Text></VStack>
      <VStack w="max" padding="13" gap="5" backgroundColor="FFF4E7" borderTop.color="$orange" borderTop.width="4"><Text fontSize="10" color="B46F1C" bold="true">2029 / AUTONOMY</Text><Text fontSize="13" color="$ink" bold="true">継続改善を標準化</Text><Text fontSize="10" color="$muted">AIエージェント、実験、学習ループ</Text></VStack>
    </HStack>
  </VStack>
  <HStack w="max" gap="14" alignItems="stretch">
    <VStack w="58%" padding="17" gap="10" backgroundColor="$surface" borderRadius="14" border.color="$line" border.width="1"><HStack justifyContent="spaceBetween"><Text fontSize="12" color="$ink" bold="true">投資ポートフォリオ</Text><Text fontSize="10" color="$muted">Impact × Readiness</Text></HStack><Matrix w="max" h="225" axisLabelColor="$muted" quadrantLabelColor="$muted" itemLabelColor="$ink"><MatrixAxes x="実行準備度" y="事業インパクト" /><MatrixQuadrants topLeft="育成投資" topRight="今すぐ拡大" bottomLeft="探索" bottomRight="効率化" /><MatrixItem label="顧客360" x="0.82" y="0.87" color="$blue" textColor="FFFFFF" /><MatrixItem label="需要予測" x="0.58" y="0.8" color="$violet" /><MatrixItem label="営業Copilot" x="0.76" y="0.62" color="$cyan" /><MatrixItem label="動的価格" x="0.34" y="0.72" color="$orange" /><MatrixItem label="文書AI" x="0.86" y="0.31" color="9AA6B8" /></Matrix></VStack>
    <VStack w="42%" gap="12">
      <VStack w="max" padding="17" gap="12" backgroundColor="$navy" borderRadius="14"><Text fontSize="10" color="$cyan" bold="true">VALUE CASE / 3 YEARS</Text><HStack justifyContent="spaceBetween"><VStack gap="2"><Text fontSize="24" color="FFFFFF" bold="true">¥3.8B</Text><Text fontSize="9" color="B9C6DD">累計効果</Text></VStack><VStack gap="2"><Text fontSize="24" color="FFFFFF" bold="true">2.4×</Text><Text fontSize="9" color="B9C6DD">ROI</Text></VStack><VStack gap="2"><Text fontSize="24" color="FFFFFF" bold="true">18 mo</Text><Text fontSize="9" color="B9C6DD">Payback</Text></VStack></HStack><Text fontSize="10" color="D7E0EF" lineHeight="1.45" padding.top="5">価値の65%は売上成長、35%は生産性・在庫最適化から創出。</Text></VStack>
      <VStack w="max" padding="16" gap="9" backgroundColor="FFF4E7" borderLeft.color="$orange" borderLeft.width="5"><Text fontSize="10" color="B46F1C" bold="true">NEXT 90 DAYS</Text><Text fontSize="13" color="$ink" bold="true">基盤を作る前に、価値を証明する。</Text><Text fontSize="10" color="$muted" lineHeight="1.45">「顧客360」を1事業部で先行稼働し、商談化率+8%を検証。結果を共通データ基盤の投資判断につなげる。</Text></VStack>
    </VStack>
  </HStack>
</VStack></Slide>`,
  },
];

export const DEFAULT_TEMPLATE = SAMPLE_TEMPLATES[0];
