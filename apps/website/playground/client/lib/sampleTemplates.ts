export interface SampleTemplate {
  id: string;
  name: string;
  xml: string;
}

export const SAMPLE_TEMPLATES: SampleTemplate[] = [
  {
    id: "financial-summary",
    name: "決算サマリー",
    xml: `<VStack w="max" h="max" padding="24" backgroundColor="F8F6F0" gap="14">
  <HStack w="max" justifyContent="spaceBetween" alignItems="center">
    <HStack gap="0" alignItems="center">
      <Shape w="6" h="52" shapeType="rect" fill.color="1F3864" />
      <VStack padding.left="14" gap="2">
        <Text fontSize="26" color="1F3864" bold="true">2025年度 第3四半期 決算サマリー</Text>
        <Text fontSize="11" color="6E7282">Financial Results Summary for Q3 FY2025｜2025年10月1日～12月31日</Text>
      </VStack>
    </HStack>
    <HStack gap="6" alignItems="center" padding.top="8" padding.bottom="8" padding.left="14" padding.right="14" backgroundColor="1F3864" borderRadius="999">
      <Icon name="trending-up" size="13" color="FFFFFF" />
      <Text fontSize="11" color="FFFFFF" bold="true">前年同期比 増収増益</Text>
    </HStack>
  </HStack>
  <HStack w="max" gap="16" alignItems="start">
    <VStack gap="12">
      <VStack w="max" padding="12" backgroundColor="1F3864" border.color="1F3864" border.width="1">
        <Text fontSize="14" color="FFFFFF" textAlign="center" bold="true">主要経営指標（連結）</Text>
      </VStack>
      <Table w="max" defaultRowHeight="38">
        <Col width="140" />
        <Col width="110" />
        <Col width="110" />
        <Col width="80" />
        <Tr>
          <Td fontSize="11" color="FFFFFF" bold="true" textAlign="center" backgroundColor="232F5C">項目</Td>
          <Td fontSize="11" color="FFFFFF" bold="true" textAlign="center" backgroundColor="232F5C">当期実績</Td>
          <Td fontSize="11" color="FFFFFF" bold="true" textAlign="center" backgroundColor="232F5C">前年同期</Td>
          <Td fontSize="11" color="FFFFFF" bold="true" textAlign="center" backgroundColor="232F5C">増減率</Td>
        </Tr>
        <Tr>
          <Td fontSize="11" color="1F3864" bold="true" backgroundColor="E5EAF1">売上高</Td>
          <Td fontSize="11" color="1A1A1A" textAlign="right" backgroundColor="FFFFFF">4,285億円</Td>
          <Td fontSize="11" color="5A5A5A" textAlign="right" backgroundColor="FFFFFF">3,892億円</Td>
          <Td fontSize="11" color="3F6232" bold="true" textAlign="center" backgroundColor="E5EBDC">+10.1%</Td>
        </Tr>
        <Tr>
          <Td fontSize="11" color="1F3864" bold="true" backgroundColor="E5EAF1">営業利益</Td>
          <Td fontSize="11" color="1A1A1A" textAlign="right" backgroundColor="FFFFFF">512億円</Td>
          <Td fontSize="11" color="5A5A5A" textAlign="right" backgroundColor="FFFFFF">438億円</Td>
          <Td fontSize="11" color="3F6232" bold="true" textAlign="center" backgroundColor="E5EBDC">+16.9%</Td>
        </Tr>
        <Tr>
          <Td fontSize="11" color="1F3864" bold="true" backgroundColor="E5EAF1">経常利益</Td>
          <Td fontSize="11" color="1A1A1A" textAlign="right" backgroundColor="FFFFFF">498億円</Td>
          <Td fontSize="11" color="5A5A5A" textAlign="right" backgroundColor="FFFFFF">421億円</Td>
          <Td fontSize="11" color="3F6232" bold="true" textAlign="center" backgroundColor="E5EBDC">+18.3%</Td>
        </Tr>
        <Tr>
          <Td fontSize="11" color="1F3864" bold="true" backgroundColor="E5EAF1">当期純利益</Td>
          <Td fontSize="11" color="1A1A1A" textAlign="right" backgroundColor="FFFFFF">328億円</Td>
          <Td fontSize="11" color="5A5A5A" textAlign="right" backgroundColor="FFFFFF">276億円</Td>
          <Td fontSize="11" color="3F6232" bold="true" textAlign="center" backgroundColor="E5EBDC">+18.8%</Td>
        </Tr>
        <Tr>
          <Td fontSize="11" color="1F3864" bold="true" backgroundColor="E5EAF1">営業利益率</Td>
          <Td fontSize="11" color="1A1A1A" textAlign="right" backgroundColor="FFFFFF">11.9%</Td>
          <Td fontSize="11" color="5A5A5A" textAlign="right" backgroundColor="FFFFFF">11.3%</Td>
          <Td fontSize="11" color="3F6232" bold="true" textAlign="center" backgroundColor="E5EBDC">+0.6pt</Td>
        </Tr>
      </Table>
      <VStack w="max" padding="10" backgroundColor="FFFFFF" border.color="CCD3DD" border.width="1">
        <VStack gap="6">
          <Text fontSize="11" color="1F3864" bold="true">【セグメント別売上構成】</Text>
          <HStack gap="8">
            <VStack padding="6" backgroundColor="E5EAF1" border.color="1F3864" border.width="1">
              <VStack gap="2" alignItems="center">
                <Text fontSize="9" color="1F3864">デジタル事業</Text>
                <Text fontSize="11" color="1F3864" bold="true">1,842億円</Text>
                <Text fontSize="9" color="6E7282">43.0%</Text>
              </VStack>
            </VStack>
            <VStack padding="6" backgroundColor="F2EDDB" border.color="B07D2C" border.width="1">
              <VStack gap="2" alignItems="center">
                <Text fontSize="9" color="8B5A1B">ソリューション</Text>
                <Text fontSize="11" color="8B5A1B" bold="true">1,285億円</Text>
                <Text fontSize="9" color="A87A2E">30.0%</Text>
              </VStack>
            </VStack>
            <VStack padding="6" backgroundColor="EAEEDF" border.color="4F7942" border.width="1">
              <VStack gap="2" alignItems="center">
                <Text fontSize="9" color="2F5732">その他</Text>
                <Text fontSize="11" color="2F5732" bold="true">1,158億円</Text>
                <Text fontSize="9" color="5A7A4E">27.0%</Text>
              </VStack>
            </VStack>
          </HStack>
        </VStack>
      </VStack>
    </VStack>
    <VStack gap="12">
      <VStack w="max" padding="12" backgroundColor="1F3864" border.color="1F3864" border.width="1">
        <Text fontSize="14" color="FFFFFF" textAlign="center" bold="true">前年同期比推移（四半期別）</Text>
      </VStack>
      <VStack w="max" padding="12" backgroundColor="FFFFFF" border.color="CCD3DD" border.width="1">
        <Chart w="480" h="180" chartType="bar" showLegend="true" chartColors='["1F3864","6B7FA8"]'>
          <ChartSeries name="売上高（億円）">
            <ChartDataPoint label="Q1" value="3980" />
            <ChartDataPoint label="Q2" value="4120" />
            <ChartDataPoint label="Q3" value="4285" />
            <ChartDataPoint label="Q4予想" value="4450" />
          </ChartSeries>
          <ChartSeries name="営業利益（億円）">
            <ChartDataPoint label="Q1" value="465" />
            <ChartDataPoint label="Q2" value="488" />
            <ChartDataPoint label="Q3" value="512" />
            <ChartDataPoint label="Q4予想" value="535" />
          </ChartSeries>
        </Chart>
      </VStack>
      <VStack w="max" padding="10" backgroundColor="FFFFFF" border.color="CCD3DD" border.width="1">
        <Table w="max" defaultRowHeight="28">
          <Col width="100" />
          <Col width="90" />
          <Col width="90" />
          <Col width="90" />
          <Col width="90" />
          <Tr>
            <Td fontSize="10" color="FFFFFF" bold="true" textAlign="center" backgroundColor="364875">指標</Td>
            <Td fontSize="10" color="FFFFFF" bold="true" textAlign="center" backgroundColor="364875">Q1</Td>
            <Td fontSize="10" color="FFFFFF" bold="true" textAlign="center" backgroundColor="364875">Q2</Td>
            <Td fontSize="10" color="FFFFFF" bold="true" textAlign="center" backgroundColor="364875">Q3</Td>
            <Td fontSize="10" color="FFFFFF" bold="true" textAlign="center" backgroundColor="364875">通期予想</Td>
          </Tr>
          <Tr>
            <Td fontSize="10" color="1F3864" backgroundColor="E5EAF1">売上高成長率</Td>
            <Td fontSize="10" color="1A1A1A" textAlign="center" backgroundColor="FFFFFF">+8.2%</Td>
            <Td fontSize="10" color="1A1A1A" textAlign="center" backgroundColor="FFFFFF">+9.5%</Td>
            <Td fontSize="10" color="3F6232" bold="true" textAlign="center" backgroundColor="E5EBDC">+10.1%</Td>
            <Td fontSize="10" color="8B5A1B" textAlign="center" backgroundColor="F2EDDB">+9.8%</Td>
          </Tr>
          <Tr>
            <Td fontSize="10" color="1F3864" backgroundColor="E5EAF1">営業利益率</Td>
            <Td fontSize="10" color="1A1A1A" textAlign="center" backgroundColor="FFFFFF">11.7%</Td>
            <Td fontSize="10" color="1A1A1A" textAlign="center" backgroundColor="FFFFFF">11.8%</Td>
            <Td fontSize="10" color="3F6232" bold="true" textAlign="center" backgroundColor="E5EBDC">11.9%</Td>
            <Td fontSize="10" color="8B5A1B" textAlign="center" backgroundColor="F2EDDB">12.0%</Td>
          </Tr>
        </Table>
      </VStack>
    </VStack>
  </HStack>
  <HStack w="max" gap="0" alignItems="center" padding.top="2">
    <Shape w="4" h="20" shapeType="rect" fill.color="1F3864" />
    <Text padding.left="10" fontSize="14" color="1F3864" bold="true">第3四半期 主要トピックス</Text>
  </HStack>
  <HStack w="max" gap="12">
    <VStack padding="14" backgroundColor="FFFFFF" border.color="CCD3DD" border.width="1" borderRadius="10">
      <VStack gap="8">
        <HStack gap="8" alignItems="center">
          <Shape w="28" h="28" shapeType="roundRect" fill.color="1F3864" fontSize="11" bold="true" color="FFFFFF" borderRadius="6">01</Shape>
          <Text fontSize="11" color="1F3864" bold="true">新規事業の収益寄与</Text>
        </HStack>
        <Text fontSize="9" color="3C3C3C" lineHeight="1.5">AI・クラウド事業が前年比+42%成長、売上構成比15%に拡大。SaaS型サービスのARR（年間経常収益）が280億円を突破。</Text>
      </VStack>
    </VStack>
    <VStack padding="14" backgroundColor="FFFFFF" border.color="CCD3DD" border.width="1" borderRadius="10">
      <VStack gap="8">
        <HStack gap="8" alignItems="center">
          <Shape w="28" h="28" shapeType="roundRect" fill.color="1F3864" fontSize="11" bold="true" color="FFFFFF" borderRadius="6">02</Shape>
          <Text fontSize="11" color="1F3864" bold="true">コスト最適化の進展</Text>
        </HStack>
        <Text fontSize="9" color="3C3C3C" lineHeight="1.5">全社DX推進により販管費率が前年比1.2pt改善。物流拠点統合で年間45億円のコスト削減を実現。</Text>
      </VStack>
    </VStack>
    <VStack padding="14" backgroundColor="FFFFFF" border.color="CCD3DD" border.width="1" borderRadius="10">
      <VStack gap="8">
        <HStack gap="8" alignItems="center">
          <Shape w="28" h="28" shapeType="roundRect" fill.color="1F3864" fontSize="11" bold="true" color="FFFFFF" borderRadius="6">03</Shape>
          <Text fontSize="11" color="1F3864" bold="true">主力製品の成長加速</Text>
        </HStack>
        <Text fontSize="9" color="3C3C3C" lineHeight="1.5">フラッグシップ製品「NEXUS Pro」が累計導入社数5,000社突破。大企業向けエンタープライズ版の受注が好調。</Text>
      </VStack>
    </VStack>
    <VStack padding="14" backgroundColor="FFFFFF" border.color="CCD3DD" border.width="1" borderRadius="10">
      <VStack gap="8">
        <HStack gap="8" alignItems="center">
          <Shape w="28" h="28" shapeType="roundRect" fill.color="1F3864" fontSize="11" bold="true" color="FFFFFF" borderRadius="6">04</Shape>
          <Text fontSize="11" color="1F3864" bold="true">海外展開の加速</Text>
        </HStack>
        <Text fontSize="9" color="3C3C3C" lineHeight="1.5">ASEAN地域売上が前年比+28%。シンガポール拠点を起点に東南アジア6カ国での事業展開を本格化。</Text>
      </VStack>
    </VStack>
  </HStack>
  <HStack w="max" gap="0" alignItems="center" justifyContent="spaceBetween">
    <Text fontSize="9" color="848591">※本資料に記載の数値はダミーデータです。実際の企業業績とは関係ありません。</Text>
    <Text fontSize="9" color="1F3864">株式会社サンプルホールディングス｜IR資料｜2025年1月発表</Text>
  </HStack>
</VStack>`,
  },
  {
    id: "product-landing",
    name: "プロダクト紹介",
    xml: `<VStack w="1280" h="max" padding="56" gap="36" backgroundColor="F8F6F0" alignItems="stretch">

  <VStack gap="18" alignItems="center">
    <HStack gap="8" alignItems="center" padding.top="6" padding.bottom="6" padding.left="14" padding.right="14" backgroundColor="E5EAF1" borderRadius="999">
      <Shape shapeType="ellipse" w="8" h="8" fill.color="2E4F7A" />
      <Text fontSize="12" bold="true" color="1F3864">NEW RELEASE｜2026 SUMMER</Text>
    </HStack>
    <Text fontSize="50" bold="true" color="0F172A" textAlign="center" lineHeight="1.2">
      次世代の業務効率化プラットフォーム
    </Text>
    <Text fontSize="18" color="475569" textAlign="center" lineHeight="1.6">
      煩雑なプロセスを自動化し、チームの生産性を最大化。
      導入から運用まで、専門チームが徹底サポートします。
    </Text>
  </VStack>

  <HStack gap="20" alignItems="stretch">
    <VStack padding="28" backgroundColor="FFFFFF" borderRadius="20" border.color="E2E8F0" border.width="1" shadow.type="outer" shadow.opacity="0.08" shadow.blur="20" shadow.offset="6">
      <VStack gap="14" alignItems="start">
        <Icon name="zap" size="22" color="2E4F7A" variant="square-filled" bgColor="EAEEF4" w="48" h="48" />
        <Text fontSize="20" bold="true" color="0F172A">圧倒的なスピード</Text>
        <Text fontSize="14" color="475569" lineHeight="1.6">
          独自のエンジンにより、従来比 約5倍の処理速度を実現。大量データもストレスなく処理します。
        </Text>
        <HStack gap="6" alignItems="center" padding.top="4">
          <Text fontSize="22" bold="true" color="2E4F7A">5×</Text>
          <Text fontSize="11" color="64748B">処理速度向上</Text>
        </HStack>
      </VStack>
    </VStack>

    <VStack padding="28" backgroundColor="FFFFFF" borderRadius="20" border.color="E2E8F0" border.width="1" shadow.type="outer" shadow.opacity="0.08" shadow.blur="20" shadow.offset="6">
      <VStack gap="14" alignItems="start">
        <Icon name="shield-check" size="22" color="3F6232" variant="square-filled" bgColor="EDF1E8" w="48" h="48" />
        <Text fontSize="20" bold="true" color="0F172A">高度なセキュリティ</Text>
        <Text fontSize="14" color="475569" lineHeight="1.6">
          金融機関レベルの暗号化技術を標準搭載。多要素認証・監査ログでデータを安全に守ります。
        </Text>
        <HStack gap="6" alignItems="center" padding.top="4">
          <Text fontSize="22" bold="true" color="3F6232">ISO 27001</Text>
          <Text fontSize="11" color="64748B">認証取得</Text>
        </HStack>
      </VStack>
    </VStack>

    <VStack padding="28" backgroundColor="FFFFFF" borderRadius="20" border.color="E2E8F0" border.width="1" shadow.type="outer" shadow.opacity="0.08" shadow.blur="20" shadow.offset="6">
      <VStack gap="14" alignItems="start">
        <Icon name="smartphone" size="22" color="8B6914" variant="square-filled" bgColor="F5F0DD" w="48" h="48" />
        <Text fontSize="20" bold="true" color="0F172A">マルチデバイス対応</Text>
        <Text fontSize="14" color="475569" lineHeight="1.6">
          PC・スマートフォン・タブレット。場所を選ばず、シームレスに業務を継続できます。
        </Text>
        <HStack gap="6" alignItems="center" padding.top="4">
          <Text fontSize="22" bold="true" color="8B6914">24/7</Text>
          <Text fontSize="11" color="64748B">どこでもアクセス</Text>
        </HStack>
      </VStack>
    </VStack>
  </HStack>

  <VStack w="max" padding="32" backgroundColor="0F172A" borderRadius="20">
    <HStack gap="24" alignItems="center" justifyContent="spaceBetween">
      <VStack gap="6" w="60%">
        <HStack gap="8" alignItems="center">
          <Icon name="sparkles" size="18" color="7C95B5" />
          <Text fontSize="14" color="7C95B5" bold="true">FREE TRIAL</Text>
        </HStack>
        <Text fontSize="26" bold="true" color="FFFFFF">まずは無料トライアルから</Text>
        <Text fontSize="14" color="94A3B8">クレジットカード不要・14日間すべての機能を体験できます。</Text>
      </VStack>
      <HStack gap="12" alignItems="center">
        <Shape shapeType="roundRect" w="200" h="52" fontSize="15" bold="true"
               fill.color="FFFFFF" color="0F172A" borderRadius="10">
          資料ダウンロード
        </Shape>
        <Shape shapeType="roundRect" w="200" h="52" fontSize="15" bold="true"
               fill.color="2E4F7A" color="FFFFFF" borderRadius="10">
          無料で始める →
        </Shape>
      </HStack>
    </HStack>
  </VStack>

</VStack>`,
  },
  {
    id: "pricing-plan",
    name: "料金プラン",
    xml: `<VStack h="max" w="max" padding="44" backgroundColor="F8F6F0" gap="28" alignItems="center">
  <VStack gap="10" alignItems="center">
    <HStack gap="6" alignItems="center" padding.top="6" padding.bottom="6" padding.left="14" padding.right="14" backgroundColor="EAEEF4" borderRadius="999">
      <Icon name="tag" size="14" color="3D5A80" />
      <Text fontSize="12" color="3D5A80" bold="true">PRICING</Text>
    </HStack>
    <Text fontSize="38" color="1E293B" bold="true">シンプルで、迷わない料金プラン</Text>
    <Text fontSize="15" color="64748B">すべてのプランに 14日間の無料トライアル付き｜年間契約で 20% OFF</Text>
  </VStack>

  <HStack w="100%" gap="20" alignItems="stretch">
    <VStack w="30%" padding="28" backgroundColor="FFFFFF" borderRadius="24" border.color="E2E8F0" border.width="1" shadow.type="outer" shadow.opacity="0.04" shadow.blur="16" shadow.offset="6">
      <VStack gap="18">
        <Icon name="sprout" size="26" color="2D6A6F" variant="square-filled" bgColor="DDE8E8" w="56" h="56" />
        <VStack gap="4">
          <Text fontSize="18" color="2D6A6F" bold="true">ライト</Text>
          <Text fontSize="11" color="94A3B8">個人・スモールチーム向け</Text>
        </VStack>
        <HStack gap="4" alignItems="end">
          <Text fontSize="40" bold="true" color="1E293B">¥0</Text>
          <Text fontSize="13" color="94A3B8">/月</Text>
        </HStack>
        <Shape shapeType="rect" w="max" h="1" fill.color="E2E8F0" />
        <Ul fontSize="13" color="475569" lineHeight="1.9">
          <Li text="最大3プロジェクト" />
          <Li text="基本テンプレート利用" />
          <Li text="コミュニティサポート" />
        </Ul>
        <Shape shapeType="roundRect" w="max" h="48" fill.color="EEEAE2" color="475569" fontSize="14" bold="true" borderRadius="10">無料で始める</Shape>
      </VStack>
    </VStack>

    <VStack w="34%" padding="28" backgroundColor="FFFFFF" borderRadius="24" border.color="3D5A80" border.width="2" shadow.type="outer" shadow.opacity="0.18" shadow.blur="32" shadow.offset="14">
      <VStack gap="18">
        <HStack w="max" justifyContent="spaceBetween" alignItems="center">
          <Icon name="rocket" size="28" color="FFFFFF" variant="square-filled" bgColor="3D5A80" w="56" h="56" />
          <Shape shapeType="roundRect" w="86" h="26" fill.color="3D5A80" color="FFFFFF" fontSize="11" bold="true" borderRadius="999">★ 一番人気</Shape>
        </HStack>
        <VStack gap="4">
          <Text fontSize="20" color="3D5A80" bold="true">スタンダード</Text>
          <Text fontSize="11" color="94A3B8">成長企業に選ばれる定番プラン</Text>
        </VStack>
        <HStack gap="4" alignItems="end">
          <Text fontSize="44" bold="true" color="1E293B">¥4,980</Text>
          <Text fontSize="13" color="94A3B8">/月</Text>
        </HStack>
        <Shape shapeType="rect" w="max" h="1" fill.color="E2E8F0" />
        <Ul fontSize="13" color="1E293B" lineHeight="1.9">
          <Li text="プロジェクト無制限" />
          <Li text="AIアシスタント機能" />
          <Li text="高度な分析レポート" />
          <Li text="24時間メールサポート" />
        </Ul>
        <Shape shapeType="roundRect" w="max" h="52" fill.color="3D5A80" shadow.type="outer" shadow.opacity="0.35" shadow.blur="14" color="FFFFFF" fontSize="15" bold="true" borderRadius="12">14日間無料で試す</Shape>
      </VStack>
    </VStack>

    <VStack w="30%" padding="28" backgroundColor="FFFFFF" borderRadius="24" border.color="E2E8F0" border.width="1" shadow.type="outer" shadow.opacity="0.04" shadow.blur="16" shadow.offset="6">
      <VStack gap="18">
        <Icon name="gem" size="26" color="8B6914" variant="square-filled" bgColor="F5F0DD" w="56" h="56" />
        <VStack gap="4">
          <Text fontSize="18" color="8B6914" bold="true">ビジネス</Text>
          <Text fontSize="11" color="94A3B8">大企業・複雑な要件向け</Text>
        </VStack>
        <Text fontSize="28" bold="true" color="1E293B">要お見積り</Text>
        <Shape shapeType="rect" w="max" h="1" fill.color="E2E8F0" />
        <Ul fontSize="13" color="475569" lineHeight="1.9">
          <Li text="専任サクセスマネージャー" />
          <Li text="SSO / SAML認証" />
          <Li text="操作ログ保存（無制限）" />
          <Li text="個別トレーニング実施" />
        </Ul>
        <Shape shapeType="roundRect" w="max" h="48" fill.color="0F172A" color="FFFFFF" fontSize="14" bold="true" borderRadius="10">お問い合わせ</Shape>
      </VStack>
    </VStack>
  </HStack>

  <Text fontSize="12" color="475569" textAlign="center" padding.top="4">✓ いつでも解約可能 ・ ✓ クレジットカード不要 ・ ✓ 日本語サポート ・ ✓ SOC 2 Type II 準拠</Text>
</VStack>`,
  },
  {
    id: "chart-showcase",
    name: "チャート集",
    xml: `<VStack w="max" h="max" padding="28" backgroundColor="F2EEE5" gap="16">
  <HStack w="max" justifyContent="spaceBetween" alignItems="center">
    <HStack gap="12" alignItems="center">
      <Icon name="bar-chart-3" size="22" color="FFFFFF" variant="square-filled" bgColor="2E4F7A" w="46" h="46" />
      <VStack gap="2">
        <Text fontSize="24" color="0D2A4D" bold="true">データビジュアライゼーション</Text>
        <Text fontSize="12" color="6B7B8E">Chart Showcase｜棒・折れ線・円・ドーナツ・レーダー・エリア</Text>
      </VStack>
    </HStack>
    <Shape shapeType="roundRect" w="120" h="28" fill.color="E3F2FD" color="2E4F7A" fontSize="11" bold="true" borderRadius="999">▣ 6 chart types</Shape>
  </HStack>
  <HStack w="max" gap="14">
    <VStack padding="16" backgroundColor="FFFFFF" border.color="E3E8EE" border.width="1" borderRadius="12" shadow.type="outer" shadow.opacity="0.04" shadow.blur="10" shadow.offset="2">
      <VStack gap="8">
        <HStack gap="8" alignItems="center">
          <Icon name="bar-chart" size="14" color="2E4F7A" />
          <Text fontSize="13" color="0D2A4D" bold="true">棒グラフ — 月別売上推移</Text>
        </HStack>
        <Chart w="420" h="200" chartType="bar" showLegend="true" chartColors='["B0BFD0","2E4F7A"]'>
          <ChartSeries name="2024年">
            <ChartDataPoint label="1月" value="320" />
            <ChartDataPoint label="2月" value="280" />
            <ChartDataPoint label="3月" value="350" />
            <ChartDataPoint label="4月" value="410" />
            <ChartDataPoint label="5月" value="380" />
            <ChartDataPoint label="6月" value="420" />
          </ChartSeries>
          <ChartSeries name="2025年">
            <ChartDataPoint label="1月" value="380" />
            <ChartDataPoint label="2月" value="340" />
            <ChartDataPoint label="3月" value="400" />
            <ChartDataPoint label="4月" value="460" />
            <ChartDataPoint label="5月" value="440" />
            <ChartDataPoint label="6月" value="500" />
          </ChartSeries>
        </Chart>
      </VStack>
    </VStack>
    <VStack padding="16" backgroundColor="FFFFFF" border.color="E3E8EE" border.width="1" borderRadius="12" shadow.type="outer" shadow.opacity="0.04" shadow.blur="10" shadow.offset="2">
      <VStack gap="8">
        <HStack gap="8" alignItems="center">
          <Icon name="trending-up" size="14" color="B07D2C" />
          <Text fontSize="13" color="0D2A4D" bold="true">折れ線グラフ — ユーザー数推移</Text>
        </HStack>
        <Chart w="420" h="200" chartType="line" showLegend="true" chartColors='["2E4F7A","B07D2C"]'>
          <ChartSeries name="MAU">
            <ChartDataPoint label="1月" value="12000" />
            <ChartDataPoint label="2月" value="14500" />
            <ChartDataPoint label="3月" value="16200" />
            <ChartDataPoint label="4月" value="19800" />
            <ChartDataPoint label="5月" value="22400" />
            <ChartDataPoint label="6月" value="25000" />
          </ChartSeries>
          <ChartSeries name="DAU">
            <ChartDataPoint label="1月" value="3200" />
            <ChartDataPoint label="2月" value="3800" />
            <ChartDataPoint label="3月" value="4500" />
            <ChartDataPoint label="4月" value="5200" />
            <ChartDataPoint label="5月" value="6100" />
            <ChartDataPoint label="6月" value="7000" />
          </ChartSeries>
        </Chart>
      </VStack>
    </VStack>
  </HStack>
  <HStack w="max" gap="14">
    <VStack padding="16" backgroundColor="FFFFFF" border.color="E3E8EE" border.width="1" borderRadius="12" shadow.type="outer" shadow.opacity="0.04" shadow.blur="10" shadow.offset="2">
      <VStack gap="8">
        <HStack gap="8" alignItems="center">
          <Icon name="pie-chart" size="14" color="2E4F7A" />
          <Text fontSize="13" color="0D2A4D" bold="true">円グラフ — 顧客構成</Text>
        </HStack>
        <Chart w="260" h="180" chartType="pie" showLegend="true" chartColors='["2E4F7A","2D6A6F","B07D2C","7560A0","78909C"]'>
          <ChartSeries name="業種別">
            <ChartDataPoint label="製造業" value="35" />
            <ChartDataPoint label="IT" value="25" />
            <ChartDataPoint label="金融" value="20" />
            <ChartDataPoint label="小売" value="12" />
            <ChartDataPoint label="その他" value="8" />
          </ChartSeries>
        </Chart>
      </VStack>
    </VStack>
    <VStack padding="16" backgroundColor="FFFFFF" border.color="E3E8EE" border.width="1" borderRadius="12" shadow.type="outer" shadow.opacity="0.04" shadow.blur="10" shadow.offset="2">
      <VStack gap="8">
        <HStack gap="8" alignItems="center">
          <Icon name="circle-dot" size="14" color="4F7942" />
          <Text fontSize="13" color="0D2A4D" bold="true">ドーナツ — 予算配分</Text>
        </HStack>
        <Chart w="260" h="180" chartType="doughnut" showLegend="true" chartColors='["2E4F7A","4F7942","B07D2C","7560A0","78909C"]'>
          <ChartSeries name="予算">
            <ChartDataPoint label="開発" value="40" />
            <ChartDataPoint label="マーケ" value="20" />
            <ChartDataPoint label="人件費" value="25" />
            <ChartDataPoint label="インフラ" value="10" />
            <ChartDataPoint label="その他" value="5" />
          </ChartSeries>
        </Chart>
      </VStack>
    </VStack>
    <VStack padding="16" backgroundColor="FFFFFF" border.color="E3E8EE" border.width="1" borderRadius="12" shadow.type="outer" shadow.opacity="0.04" shadow.blur="10" shadow.offset="2">
      <VStack gap="8">
        <HStack gap="8" alignItems="center">
          <Icon name="radar" size="14" color="7560A0" />
          <Text fontSize="13" color="0D2A4D" bold="true">レーダー — スキル評価</Text>
        </HStack>
        <Chart w="260" h="180" chartType="radar" showLegend="true" chartColors='["2E4F7A","B07D2C"]'>
          <ChartSeries name="チームA">
            <ChartDataPoint label="技術" value="90" />
            <ChartDataPoint label="管理" value="70" />
            <ChartDataPoint label="企画" value="80" />
            <ChartDataPoint label="営業" value="60" />
            <ChartDataPoint label="分析" value="85" />
          </ChartSeries>
          <ChartSeries name="チームB">
            <ChartDataPoint label="技術" value="75" />
            <ChartDataPoint label="管理" value="85" />
            <ChartDataPoint label="企画" value="70" />
            <ChartDataPoint label="営業" value="80" />
            <ChartDataPoint label="分析" value="65" />
          </ChartSeries>
        </Chart>
      </VStack>
    </VStack>
  </HStack>
  <VStack w="max" padding="16" backgroundColor="FFFFFF" border.color="E3E8EE" border.width="1" borderRadius="12" shadow.type="outer" shadow.opacity="0.04" shadow.blur="10" shadow.offset="2">
    <VStack gap="8">
      <HStack gap="8" alignItems="center">
        <Icon name="area-chart" size="14" color="2E4F7A" />
        <Text fontSize="13" color="0D2A4D" bold="true">エリアチャート — トラフィック推移（曜日別）</Text>
      </HStack>
      <Chart w="max" h="160" chartType="area" showLegend="true" chartColors='["2E4F7A","B0BFD0"]'>
        <ChartSeries name="オーガニック">
          <ChartDataPoint label="月" value="4500" />
          <ChartDataPoint label="火" value="5200" />
          <ChartDataPoint label="水" value="4800" />
          <ChartDataPoint label="木" value="5800" />
          <ChartDataPoint label="金" value="6200" />
          <ChartDataPoint label="土" value="3200" />
          <ChartDataPoint label="日" value="2800" />
        </ChartSeries>
        <ChartSeries name="広告">
          <ChartDataPoint label="月" value="2000" />
          <ChartDataPoint label="火" value="2400" />
          <ChartDataPoint label="水" value="2200" />
          <ChartDataPoint label="木" value="2800" />
          <ChartDataPoint label="金" value="3100" />
          <ChartDataPoint label="土" value="1500" />
          <ChartDataPoint label="日" value="1200" />
        </ChartSeries>
      </Chart>
    </VStack>
  </VStack>
</VStack>`,
  },
  {
    id: "project-dashboard",
    name: "プロジェクト管理ダッシュボード",
    xml: `<VStack w="max" h="max" padding="28" backgroundColor="0B1220" gap="18">
  <HStack w="max" justifyContent="spaceBetween" alignItems="center">
    <HStack gap="14" alignItems="center">
      <Icon name="layout-dashboard" size="24" color="7C95B5" variant="square-filled" bgColor="1A2840" w="50" h="50" />
      <VStack gap="2">
        <Text fontSize="26" color="F8F6F0" bold="true">プロジェクト管理ダッシュボード</Text>
        <Text fontSize="11" color="94A3B8">Project phases, delivery flow, governance &amp; team in one view</Text>
      </VStack>
    </HStack>
    <HStack gap="10" alignItems="center">
      <Shape shapeType="roundRect" w="120" h="28" fill.color="1E2C20" border.color="3F6232" border.width="1" color="7A9968" fontSize="11" bold="true" borderRadius="999">● ON TRACK</Shape>
      <Shape shapeType="roundRect" w="120" h="28" fill.color="1A2840" border.color="1F3864" border.width="1" color="7C95B5" fontSize="11" bold="true" borderRadius="999">Phase 3｜開発中</Shape>
    </HStack>
  </HStack>

  <HStack w="max" gap="18" alignItems="stretch">
    <VStack w="58%" gap="18">
      <VStack w="max" padding="16" backgroundColor="111827" border.color="334155" border.width="1" borderRadius="18">
        <VStack gap="12">
          <HStack justifyContent="spaceBetween" alignItems="center">
            <HStack gap="10" alignItems="center">
              <Icon name="calendar-range" size="18" color="B0BFD0" variant="square-filled" bgColor="1F3864" w="38" h="38" />
              <Text fontSize="18" color="E2E8F0" bold="true">プロジェクトフェーズ</Text>
            </HStack>
            <Text fontSize="11" color="94A3B8">Timeline</Text>
          </HStack>
          <Timeline w="max" direction="horizontal">
            <TimelineItem date="Phase 1" title="要件定義" description="スコープ確定・体制準備" color="7C95B5" />
            <TimelineItem date="Phase 2" title="設計" description="UI/技術設計・レビュー" color="818CF8" />
            <TimelineItem date="Phase 3" title="開発" description="実装・結合" color="7A9968" />
            <TimelineItem date="Phase 4" title="検証" description="QA・受入テスト" color="B07D2C" />
            <TimelineItem date="Phase 5" title="展開" description="リリース・定着化" color="A87085" />
          </Timeline>
        </VStack>
      </VStack>

      <VStack w="max" padding="16" backgroundColor="111827" border.color="334155" border.width="1" borderRadius="18">
        <VStack gap="12">
          <HStack justifyContent="spaceBetween" alignItems="center">
            <HStack gap="10" alignItems="center">
              <Icon name="workflow" size="18" color="A0B89A" variant="square-filled" bgColor="263F2A" w="38" h="38" />
              <Text fontSize="18" color="E2E8F0" bold="true">開発プロセス</Text>
            </HStack>
            <Text fontSize="11" color="94A3B8">ProcessArrow</Text>
          </HStack>
          <ProcessArrow w="max" direction="horizontal" itemHeight="56" fontSize="12" bold="true">
            <ProcessArrowStep label="Backlog整理" color="1F3864" textColor="FFFFFF" />
            <ProcessArrowStep label="Sprint計画" color="2E4F7A" textColor="FFFFFF" />
            <ProcessArrowStep label="Build &amp; Code" color="3F6232" textColor="FFFFFF" />
            <ProcessArrowStep label="Test" color="8B6914" textColor="FFFFFF" />
            <ProcessArrowStep label="Deploy" color="8B3A4A" textColor="FFFFFF" />
          </ProcessArrow>
        </VStack>
      </VStack>

      <VStack w="max" padding="16" backgroundColor="111827" border.color="334155" border.width="1" borderRadius="18">
        <VStack gap="12">
          <HStack justifyContent="spaceBetween" alignItems="center">
            <HStack gap="10" alignItems="center">
              <Icon name="git-fork" size="18" color="D9C57A" variant="square-filled" bgColor="5C4A1E" w="38" h="38" />
              <Text fontSize="18" color="E2E8F0" bold="true">意思決定フロー</Text>
            </HStack>
            <Text fontSize="11" color="94A3B8">Flow</Text>
          </HStack>
          <Flow w="max" h="130" direction="horizontal" nodeWidth="108" nodeHeight="46" nodeGap="48" connectorStyle.color="64748B" connectorStyle.width="2" connectorStyle.arrowType="arrow">
            <FlowNode id="start" shape="flowChartTerminator" text="要求受付" color="1F3864" textColor="FFFFFF" />
            <FlowNode id="review" shape="flowChartProcess" text="影響評価" color="334155" textColor="FFFFFF" />
            <FlowNode id="decision" shape="flowChartDecision" text="承認?" color="5B4380" textColor="FFFFFF" />
            <FlowNode id="implement" shape="flowChartProcess" text="実装へ" color="3F6232" textColor="FFFFFF" />
            <FlowNode id="hold" shape="flowChartProcess" text="保留/再調整" color="92400E" textColor="FFFFFF" />
            <FlowConnection from="start" to="review" color="64748B" />
            <FlowConnection from="review" to="decision" color="64748B" />
            <FlowConnection from="decision" to="implement" label="Yes" color="7A9968" />
            <FlowConnection from="decision" to="hold" label="No" color="B07D2C" />
          </Flow>
        </VStack>
      </VStack>
    </VStack>

    <VStack w="42%" gap="18">
      <VStack w="max" padding="16" backgroundColor="111827" border.color="334155" border.width="1" borderRadius="18">
        <VStack gap="12">
          <HStack justifyContent="spaceBetween" alignItems="center">
            <HStack gap="10" alignItems="center">
              <Icon name="users" size="18" color="C2BBD3" variant="square-filled" bgColor="3D2E5B" w="38" h="38" />
              <Text fontSize="18" color="E2E8F0" bold="true">プロジェクト組織図</Text>
            </HStack>
            <Text fontSize="11" color="94A3B8">Tree</Text>
          </HStack>
          <Tree w="max" h="220" layout="vertical" nodeShape="roundRect" nodeWidth="118" nodeHeight="38" levelGap="36" siblingGap="14" connectorStyle.color="475569" connectorStyle.width="2">
            <TreeItem label="Steering Committee" color="1F3864">
              <TreeItem label="PMO" color="0F766E">
                <TreeItem label="Dev Lead" color="5B4380" />
                <TreeItem label="QA Lead" color="8B6914" />
                <TreeItem label="Design Lead" color="8B3A4A" />
              </TreeItem>
            </TreeItem>
          </Tree>
        </VStack>
      </VStack>

      <VStack w="max" padding="14" backgroundColor="111827" border.color="334155" border.width="1" borderRadius="18">
        <VStack gap="10">
          <HStack gap="10" alignItems="center">
            <Icon name="activity" size="18" color="A87085" variant="square-filled" bgColor="3F1F26" w="38" h="38" />
            <Text fontSize="16" color="E2E8F0" bold="true">ステータスハイライト</Text>
          </HStack>
          <HStack w="max" gap="10">
            <VStack w="max" padding="10" backgroundColor="0F172A" border.color="1F3864" border.width="1" borderRadius="12">
              <HStack gap="10" alignItems="center">
                <Icon name="target" size="18" color="7C95B5" variant="circle-filled" bgColor="1A2840" w="36" h="36" />
                <VStack gap="0">
                  <Text fontSize="10" color="94A3B8">進捗率</Text>
                  <Text fontSize="20" color="F8F6F0" bold="true">68%</Text>
                </VStack>
              </HStack>
            </VStack>
            <VStack w="max" padding="10" backgroundColor="0F172A" border.color="3F6232" border.width="1" borderRadius="12">
              <HStack gap="10" alignItems="center">
                <Icon name="check-check" size="18" color="7A9968" variant="circle-filled" bgColor="1E2C20" w="36" h="36" />
                <VStack gap="0">
                  <Text fontSize="10" color="94A3B8">完了タスク</Text>
                  <Text fontSize="20" color="F8F6F0" bold="true">124</Text>
                </VStack>
              </HStack>
            </VStack>
          </HStack>
          <HStack w="max" gap="10">
            <VStack w="max" padding="10" backgroundColor="0F172A" border.color="5C4A1E" border.width="1" borderRadius="12">
              <HStack gap="10" alignItems="center">
                <Icon name="alert-triangle" size="18" color="B07D2C" variant="circle-filled" bgColor="3D331A" w="36" h="36" />
                <VStack gap="0">
                  <Text fontSize="10" color="94A3B8">リスク</Text>
                  <Text fontSize="20" color="F8F6F0" bold="true">05</Text>
                </VStack>
              </HStack>
            </VStack>
            <VStack w="max" padding="10" backgroundColor="0F172A" border.color="3D2E5B" border.width="1" borderRadius="12">
              <HStack gap="10" alignItems="center">
                <Icon name="clock-3" size="18" color="A28DC0" variant="circle-filled" bgColor="2A1F40" w="36" h="36" />
                <VStack gap="0">
                  <Text fontSize="10" color="94A3B8">次回レビュー</Text>
                  <Text fontSize="15" color="F8F6F0" bold="true">Fri 16:00</Text>
                </VStack>
              </HStack>
            </VStack>
          </HStack>
        </VStack>
      </VStack>
    </VStack>
  </HStack>
</VStack>`,
  },
  {
    id: "strategy-analysis",
    name: "経営戦略分析",
    xml: `<VStack w="1280" h="720" padding="32" backgroundColor="F8F6F0" gap="18">
 <HStack w="max" justifyContent="spaceBetween" alignItems="center">
 <HStack gap="14" alignItems="center">
 <Icon name="briefcase" size="26" color="2E4F7A" variant="circle-filled" bgColor="E5EAF1" w="54" h="54" />
 <VStack gap="2">
 <Text fontSize="30" color="0F172A" bold="true">経営戦略分析</Text>
 <Text fontSize="13" color="64748B">Strategic Analysis Overview｜重点施策・優先順位・実行計画</Text>
 </VStack>
 </HStack>
 <Shape shapeType="roundRect" w="190" h="32" fill.color="F2F5F9" border.color="D8DFE8" border.width="1" color="1F3864" fontSize="12" bold="true" borderRadius="18">FY2026 Strategic Focus</Shape>
 </HStack>

 <Line x1="32" y1="92" x2="1248" y2="92" color="D5DBE3" lineWidth="2" />

 <HStack w="max" h="max" gap="18" alignItems="stretch">
 <VStack w="35%" gap="14">
 <VStack w="max" padding="18" backgroundColor="FFFFFF" border.color="D5DBE3" border.width="1" borderRadius="16">
 <VStack gap="14">
 <HStack gap="10" alignItems="center">
 <Icon name="layers-3" size="20" color="2E4F7A" variant="square-filled" bgColor="E5EAF1" w="40" h="40" />
 <Text fontSize="18" color="1F3864" bold="true">戦略ピラミッド</Text>
 </HStack>
 <Pyramid w="max" h="250" direction="down" fontSize="14" bold="true">
 <PyramidLevel label="ビジョン" color="E5EAF1" textColor="1F3864" />
 <PyramidLevel label="重点戦略" color="B0BFD0" textColor="0F172A" />
 <PyramidLevel label="実行基盤" color="7C95B5" textColor="1F3864" />
 <PyramidLevel label="施策群" color="2E4F7A" textColor="FFFFFF" />
 </Pyramid>
 </VStack>
 </VStack>

 <VStack w="max" padding="16" backgroundColor="FFFFFF" border.color="D5DBE3" border.width="1" borderRadius="16">
 <VStack gap="10">
 <HStack gap="10" alignItems="center">
 <Icon name="list-checks" size="20" color="1F3864" variant="square-filled" bgColor="E5EAF1" w="40" h="40" />
 <Text fontSize="18" color="1F3864" bold="true">アクションプラン</Text>
 </HStack>
 <VStack gap="10">
 <HStack gap="10" alignItems="start">
 <Shape w="22" h="22" shapeType="ellipse" fill.color="E5EAF1" color="1F3864" fontSize="11" bold="true">1</Shape>
 <Text fontSize="13" color="334155" lineHeight="1.5">重点顧客セグメントを再定義し、営業資源を再配分する</Text>
 </HStack>
 <HStack gap="10" alignItems="start">
 <Shape w="22" h="22" shapeType="ellipse" fill.color="E5EAF1" color="1F3864" fontSize="11" bold="true">2</Shape>
 <Text fontSize="13" color="334155" lineHeight="1.5">基幹業務のデジタル化投資を優先し、収益性を改善する</Text>
 </HStack>
 <HStack gap="10" alignItems="start">
 <Shape w="22" h="22" shapeType="ellipse" fill.color="E5EAF1" color="1F3864" fontSize="11" bold="true">3</Shape>
 <Text fontSize="13" color="334155" lineHeight="1.5">新市場向けパートナー戦略を立ち上げ、成長機会を拡大する</Text>
 </HStack>
 <HStack gap="10" alignItems="start">
 <Shape w="22" h="22" shapeType="ellipse" fill.color="E5EAF1" color="1F3864" fontSize="11" bold="true">4</Shape>
 <Text fontSize="13" color="334155" lineHeight="1.5">KPIレビューを月次化し、施策の継続判断を高速化する</Text>
 </HStack>
 </VStack>
 </VStack>
 </VStack>
 </VStack>

 <VStack w="65%" gap="14">
 <VStack w="max" padding="18" backgroundColor="FFFFFF" border.color="D5DBE3" border.width="1" borderRadius="16">
 <VStack gap="12">
 <HStack justifyContent="spaceBetween" alignItems="center">
 <HStack gap="10" alignItems="center">
 <Icon name="layout-grid" size="20" color="2E4F7A" variant="square-filled" bgColor="E5EAF1" w="40" h="40" />
 <Text fontSize="18" color="1F3864" bold="true">優先度マトリクス</Text>
 </HStack>
 <Text fontSize="12" color="64748B">縦軸: 事業インパクト / 横軸: 実現容易性</Text>
 </HStack>
 <Matrix w="max" h="350">
 <MatrixAxes x="実現容易性" y="事業インパクト" />
 <MatrixQuadrants topLeft="要検討" topRight="最優先" bottomLeft="後回し" bottomRight="効率案件" />
 <MatrixItem label="価格戦略見直し" x="0.72" y="0.84" color="1F3864" />
 <MatrixItem label="営業DX" x="0.66" y="0.76" color="2E4F7A" />
 <MatrixItem label="新市場参入" x="0.38" y="0.86" color="7C95B5" />
 <MatrixItem label="管理部門効率化" x="0.82" y="0.42" color="B0BFD0" />
 <MatrixItem label="ブランド再構築" x="0.44" y="0.58" color="4A6FA5" />
 <MatrixItem label="全社ERP刷新" x="0.26" y="0.36" color="D8DFE8" />
 </Matrix>
 </VStack>
 </VStack>

 <HStack w="max" gap="14">
 <VStack w="max" padding="16" backgroundColor="FFFFFF" border.color="D5DBE3" border.width="1" borderRadius="16">
 <VStack gap="10">
 <HStack gap="10" alignItems="center">
 <Icon name="target" size="18" color="2E4F7A" variant="circle-filled" bgColor="E5EAF1" w="38" h="38" />
 <Text fontSize="16" color="1F3864" bold="true">示唆</Text>
 </HStack>
 <Text fontSize="13" color="475569" lineHeight="1.55">高インパクトかつ実現容易性の高い「価格戦略見直し」と「営業DX」を最優先とし、短期成果を創出しながら中長期施策へ投資余力を回す構成が有効です。</Text>
 </VStack>
 </VStack>
 <VStack w="max" padding="16" backgroundColor="FFFFFF" border.color="D5DBE3" border.width="1" borderRadius="16">
 <VStack gap="10">
 <HStack gap="10" alignItems="center">
 <Icon name="shield-check" size="18" color="1F3864" variant="circle-filled" bgColor="E5EAF1" w="38" h="38" />
 <Text fontSize="16" color="1F3864" bold="true">経営メッセージ</Text>
 </HStack>
 <Text fontSize="13" color="475569" lineHeight="1.55">短期の利益改善施策と、中期の変革投資を二層で管理することで、成長性と確実性のバランスを取りやすくなります。</Text>
 </VStack>
 </VStack>
 </HStack>
 </VStack>
 </HStack>
</VStack>`,
  },
  {
    id: "saas-kpi",
    name: "SaaS KPIダッシュボード",
    xml: `<VStack w="max" h="max" padding="28" backgroundColor="0F172A" gap="18">

  <HStack w="max" alignItems="center" justifyContent="spaceBetween">
    <HStack gap="12" alignItems="center">
      <Icon name="activity" size="28" color="7A9968" variant="square-filled" bgColor="263F2A" w="44" h="44" />
      <VStack gap="2">
        <Text fontSize="22" color="EEEAE2" bold="true">SaaS KPI Dashboard</Text>
        <Text fontSize="11" color="64748B">2025 Q2 — リアルタイム業績モニタリング</Text>
      </VStack>
    </HStack>
    <HStack gap="8" alignItems="center">
      <Shape shapeType="roundRect" w="60" h="24" fill.color="1E2C20" border.color="3F6232" border.width="1" color="7A9968" fontSize="11" bold="true" borderRadius="6">● LIVE</Shape>
      <Shape shapeType="roundRect" w="180" h="24" fill.color="1E293B" color="94A3B8" fontSize="11" borderRadius="6">最終更新: 2025-06-30 09:00</Shape>
    </HStack>
  </HStack>

  <HStack w="max" gap="12">
    <VStack w="max" padding="16" backgroundColor="1E293B" borderRadius="12" border.color="1E3A5F" border.width="1">
      <VStack gap="8">
        <HStack alignItems="center" justifyContent="spaceBetween">
          <Text fontSize="11" color="64748B">MRR</Text>
          <Icon name="trending-up" size="16" color="5B7AA8" variant="circle-filled" bgColor="1F2D3D" w="28" h="28" />
        </HStack>
        <Text fontSize="26" color="EEEAE2" bold="true">¥48.2M</Text>
        <HStack gap="4" alignItems="center">
          <Icon name="arrow-up" size="12" color="7A9968" />
          <Text fontSize="11" color="7A9968" bold="true">+12.4%</Text>
          <Text fontSize="11" color="475569">前月比</Text>
        </HStack>
      </VStack>
    </VStack>
    <VStack w="max" padding="16" backgroundColor="1E293B" borderRadius="12" border.color="1E3A5F" border.width="1">
      <VStack gap="8">
        <HStack alignItems="center" justifyContent="spaceBetween">
          <Text fontSize="11" color="64748B">ARR</Text>
          <Icon name="bar-chart" size="16" color="5B7AA8" variant="circle-filled" bgColor="1F2D3D" w="28" h="28" />
        </HStack>
        <Text fontSize="26" color="EEEAE2" bold="true">¥578M</Text>
        <HStack gap="4" alignItems="center">
          <Icon name="arrow-up" size="12" color="7A9968" />
          <Text fontSize="11" color="7A9968" bold="true">+18.2%</Text>
          <Text fontSize="11" color="475569">前年比</Text>
        </HStack>
      </VStack>
    </VStack>
    <VStack w="max" padding="16" backgroundColor="1E293B" borderRadius="12" border.color="1E3A5F" border.width="1">
      <VStack gap="8">
        <HStack alignItems="center" justifyContent="spaceBetween">
          <Text fontSize="11" color="64748B">Churn Rate</Text>
          <Icon name="user-minus" size="16" color="B65555" variant="circle-filled" bgColor="3A2424" w="28" h="28" />
        </HStack>
        <Text fontSize="26" color="EEEAE2" bold="true">1.8%</Text>
        <HStack gap="4" alignItems="center">
          <Icon name="arrow-down" size="12" color="7A9968" />
          <Text fontSize="11" color="7A9968" bold="true">-0.3pt</Text>
          <Text fontSize="11" color="475569">前月比</Text>
        </HStack>
      </VStack>
    </VStack>
    <VStack w="max" padding="16" backgroundColor="1E293B" borderRadius="12" border.color="1E3A5F" border.width="1">
      <VStack gap="8">
        <HStack alignItems="center" justifyContent="spaceBetween">
          <Text fontSize="11" color="64748B">NRR</Text>
          <Icon name="refresh-cw" size="16" color="7A9968" variant="circle-filled" bgColor="263F2A" w="28" h="28" />
        </HStack>
        <Text fontSize="26" color="EEEAE2" bold="true">118%</Text>
        <HStack gap="4" alignItems="center">
          <Icon name="arrow-up" size="12" color="7A9968" />
          <Text fontSize="11" color="7A9968" bold="true">+3pt</Text>
          <Text fontSize="11" color="475569">前四半期比</Text>
        </HStack>
      </VStack>
    </VStack>
  </HStack>

  <HStack w="max" gap="14" alignItems="start">
    <VStack w="max" gap="12">
      <VStack w="max" padding="16" backgroundColor="1E293B" borderRadius="12" border.color="1E3A5F" border.width="1">
        <VStack gap="8">
          <HStack alignItems="center" gap="8">
            <Icon name="line-chart" size="14" color="5B7AA8" />
            <Text fontSize="13" color="CBD5E1" bold="true">MRR 推移（直近12ヶ月）</Text>
          </HStack>
          <Chart w="max" h="160" chartType="line" showLegend="true" chartColors='["5B7AA8","7A9968"]'>
            <ChartSeries name="MRR (万円)">
              <ChartDataPoint label="7月" value="3280" />
              <ChartDataPoint label="8月" value="3450" />
              <ChartDataPoint label="9月" value="3620" />
              <ChartDataPoint label="10月" value="3810" />
              <ChartDataPoint label="11月" value="3990" />
              <ChartDataPoint label="12月" value="4150" />
              <ChartDataPoint label="1月" value="4280" />
              <ChartDataPoint label="2月" value="4390" />
              <ChartDataPoint label="3月" value="4510" />
              <ChartDataPoint label="4月" value="4640" />
              <ChartDataPoint label="5月" value="4750" />
              <ChartDataPoint label="6月" value="4820" />
            </ChartSeries>
            <ChartSeries name="新規MRR (万円)">
              <ChartDataPoint label="7月" value="420" />
              <ChartDataPoint label="8月" value="480" />
              <ChartDataPoint label="9月" value="510" />
              <ChartDataPoint label="10月" value="560" />
              <ChartDataPoint label="11月" value="590" />
              <ChartDataPoint label="12月" value="620" />
              <ChartDataPoint label="1月" value="580" />
              <ChartDataPoint label="2月" value="610" />
              <ChartDataPoint label="3月" value="650" />
              <ChartDataPoint label="4月" value="680" />
              <ChartDataPoint label="5月" value="700" />
              <ChartDataPoint label="6月" value="730" />
            </ChartSeries>
          </Chart>
        </VStack>
      </VStack>

      <VStack w="max" padding="16" backgroundColor="1E293B" borderRadius="12" border.color="1E3A5F" border.width="1">
        <VStack gap="8">
          <HStack alignItems="center" gap="8">
            <Icon name="table" size="14" color="5B7AA8" />
            <Text fontSize="13" color="CBD5E1" bold="true">プラン別 主要メトリクス</Text>
          </HStack>
          <Table w="max" defaultRowHeight="28">
            <Col width="90" />
            <Col width="80" />
            <Col width="80" />
            <Col width="80" />
            <Col width="70" />
            <Col width="70" />
            <Tr>
              <Td fontSize="10" color="94A3B8" bold="true" backgroundColor="0F172A" textAlign="center">プラン</Td>
              <Td fontSize="10" color="94A3B8" bold="true" backgroundColor="0F172A" textAlign="center">契約数</Td>
              <Td fontSize="10" color="94A3B8" bold="true" backgroundColor="0F172A" textAlign="center">MRR貢献</Td>
              <Td fontSize="10" color="94A3B8" bold="true" backgroundColor="0F172A" textAlign="center">ARPU</Td>
              <Td fontSize="10" color="94A3B8" bold="true" backgroundColor="0F172A" textAlign="center">Churn</Td>
              <Td fontSize="10" color="94A3B8" bold="true" backgroundColor="0F172A" textAlign="center">NRR</Td>
            </Tr>
            <Tr>
              <Td fontSize="10" color="5B7AA8" bold="true" backgroundColor="1E293B">Starter</Td>
              <Td fontSize="10" color="E2E8F0" textAlign="center" backgroundColor="1E293B">1,240</Td>
              <Td fontSize="10" color="E2E8F0" textAlign="center" backgroundColor="1E293B">¥6.2M</Td>
              <Td fontSize="10" color="E2E8F0" textAlign="center" backgroundColor="1E293B">¥5,000</Td>
              <Td fontSize="10" color="B65555" textAlign="center" backgroundColor="1E293B">3.2%</Td>
              <Td fontSize="10" color="7A9968" textAlign="center" backgroundColor="1E293B">102%</Td>
            </Tr>
            <Tr>
              <Td fontSize="10" color="7A9968" bold="true" backgroundColor="162032">Growth</Td>
              <Td fontSize="10" color="E2E8F0" textAlign="center" backgroundColor="162032">680</Td>
              <Td fontSize="10" color="E2E8F0" textAlign="center" backgroundColor="162032">¥20.4M</Td>
              <Td fontSize="10" color="E2E8F0" textAlign="center" backgroundColor="162032">¥30,000</Td>
              <Td fontSize="10" color="C9A23F" textAlign="center" backgroundColor="162032">1.5%</Td>
              <Td fontSize="10" color="7A9968" textAlign="center" backgroundColor="162032">115%</Td>
            </Tr>
            <Tr>
              <Td fontSize="10" color="9D8FB8" bold="true" backgroundColor="1E293B">Enterprise</Td>
              <Td fontSize="10" color="E2E8F0" textAlign="center" backgroundColor="1E293B">142</Td>
              <Td fontSize="10" color="E2E8F0" textAlign="center" backgroundColor="1E293B">¥21.6M</Td>
              <Td fontSize="10" color="E2E8F0" textAlign="center" backgroundColor="1E293B">¥152,000</Td>
              <Td fontSize="10" color="7A9968" textAlign="center" backgroundColor="1E293B">0.4%</Td>
              <Td fontSize="10" color="7A9968" textAlign="center" backgroundColor="1E293B">128%</Td>
            </Tr>
          </Table>
        </VStack>
      </VStack>
    </VStack>

    <VStack gap="12" w="340">
      <VStack w="max" padding="16" backgroundColor="1E293B" borderRadius="12" border.color="263F2A" border.width="1">
        <VStack gap="10">
          <HStack alignItems="center" gap="8">
            <Icon name="zap" size="14" color="7A9968" variant="circle-filled" bgColor="263F2A" w="24" h="24" />
            <Text fontSize="13" color="CBD5E1" bold="true">注目ポイント</Text>
          </HStack>
          <Ul fontSize="12" color="94A3B8" lineHeight="1.6">
            <Li color="7A9968" bold="true" text="Enterprise NRR 128% — 過去最高を更新" />
            <Li text="Growthプランへのアップグレード率が前月比+22%" />
            <Li text="CAC 8.9%削減でLTV/CAC比が15倍超に改善" />
            <Li color="5B7AA8" bold="true" text="新規MRR ¥7.3M — 3ヶ月連続で過去最高" />
            <Li text="Churn Rate 1.8% — 業界平均(3.5%)を大幅に下回る" />
          </Ul>
        </VStack>
      </VStack>

      <VStack w="max" padding="16" backgroundColor="1E293B" borderRadius="12" border.color="1E3A5F" border.width="1">
        <VStack gap="10">
          <HStack alignItems="center" gap="8">
            <Icon name="users" size="14" color="5B7AA8" />
            <Text fontSize="13" color="CBD5E1" bold="true">顧客数サマリー</Text>
          </HStack>
          <HStack w="max" gap="8">
            <VStack w="max" padding="10" backgroundColor="0F172A" borderRadius="8">
              <VStack gap="4" alignItems="center">
                <Text fontSize="18" color="5B7AA8" bold="true">2,062</Text>
                <Text fontSize="10" color="64748B">総契約数</Text>
              </VStack>
            </VStack>
            <VStack w="max" padding="10" backgroundColor="0F172A" borderRadius="8">
              <VStack gap="4" alignItems="center">
                <Text fontSize="18" color="7A9968" bold="true">+148</Text>
                <Text fontSize="10" color="64748B">今月純増</Text>
              </VStack>
            </VStack>
            <VStack w="max" padding="10" backgroundColor="0F172A" borderRadius="8">
              <VStack gap="4" alignItems="center">
                <Text fontSize="18" color="9D8FB8" bold="true">94.2%</Text>
                <Text fontSize="10" color="64748B">継続率</Text>
              </VStack>
            </VStack>
          </HStack>
        </VStack>
      </VStack>
    </VStack>
  </HStack>

  <VStack w="max" padding="16" backgroundColor="1E293B" borderRadius="12" border.color="1E3A5F" border.width="1">
    <VStack gap="10">
      <HStack alignItems="center" gap="8">
        <Icon name="flag" size="14" color="7A9968" />
        <Text fontSize="13" color="CBD5E1" bold="true">2025年 四半期マイルストーン</Text>
      </HStack>
      <Timeline direction="horizontal" w="max">
        <TimelineItem date="Q1 2025" title="ARR ¥480M 達成" description="Enterprise契約が前年比+45%" color="5B7AA8" />
        <TimelineItem date="Q2 2025" title="NRR 118% 更新" description="アップセル強化施策が奏功" color="7A9968" />
        <TimelineItem date="Q3 2025 (予)" title="ARR ¥600M 目標" description="APAC市場への本格展開" color="9D8FB8" />
        <TimelineItem date="Q4 2025 (予)" title="IPO 準備フェーズ" description="監査法人選定・財務体制強化" color="C9A23F" />
      </Timeline>
    </VStack>
  </VStack>

  <HStack w="max" justifyContent="spaceBetween" alignItems="center">
    <Text fontSize="10" color="334155">© 2025 SaaS Co. — Confidential</Text>
    <HStack gap="16">
      <HStack gap="4" alignItems="center">
        <Shape shapeType="ellipse" w="6" h="6" fill.color="5B7AA8" />
        <Text fontSize="10" color="475569">MRR</Text>
      </HStack>
      <HStack gap="4" alignItems="center">
        <Shape shapeType="ellipse" w="6" h="6" fill.color="7A9968" />
        <Text fontSize="10" color="475569">成長指標</Text>
      </HStack>
      <HStack gap="4" alignItems="center">
        <Shape shapeType="ellipse" w="6" h="6" fill.color="9D8FB8" />
        <Text fontSize="10" color="475569">Enterprise</Text>
      </HStack>
    </HStack>
  </HStack>

</VStack>`,
  },
  {
    id: "dx-roadmap",
    name: "DX推進ロードマップ",
    xml: `<VStack w="max" h="max" padding="28" backgroundColor="F2F0EA" gap="14">
  
  <HStack w="max" gap="12" alignItems="center">
    <Icon name="rocket" size="28" color="FFFFFF" variant="square-filled" bgColor="6C3AED" w="48" h="48" />
    <VStack gap="2">
      <Text fontSize="32" color="2D2D40" bold="true">DX推進ロードマップ 2025-2029</Text>
      <Text fontSize="13" color="6E7282">Digital Transformation Roadmap — 全社横断デジタル変革プログラム</Text>
    </VStack>
  </HStack>

  <HStack w="max" gap="14" alignItems="start">

    <VStack w="max" gap="12">
      
      <HStack gap="6" alignItems="center">
        <Icon name="arrow-right-circle" size="16" color="5B4380" />
        <Text fontSize="15" color="3D2E5B" bold="true">DX推進フェーズ</Text>
      </HStack>
      <ProcessArrow w="max" h="72" direction="horizontal" itemWidth="120" itemHeight="64" fontSize="11" bold="true">
        <ProcessArrowStep label="現状分析" color="C2BBD3" textColor="2E2447" />
        <ProcessArrowStep label="基盤構築" color="9D8FB8" textColor="2E2447" />
        <ProcessArrowStep label="業務変革" color="7560A0" textColor="FFFFFF" />
        <ProcessArrowStep label="データ駆動" color="5B4380" textColor="FFFFFF" />
        <ProcessArrowStep label="自律進化" color="3D2E5B" textColor="FFFFFF" />
      </ProcessArrow>

      <HStack gap="6" alignItems="center" margin.top="4">
        <Icon name="triangle" size="16" color="2E4F7A" />
        <Text fontSize="15" color="1F3864" bold="true">DX成熟度モデル</Text>
      </HStack>
      <Pyramid w="max" h="220" direction="up" fontSize="11" bold="true">
        <PyramidLevel label="自律進化" color="1F3864" textColor="FFFFFF" />
        <PyramidLevel label="データ駆動経営" color="2E4F7A" textColor="FFFFFF" />
        <PyramidLevel label="業務プロセス最適化" color="4A6FA5" textColor="FFFFFF" />
        <PyramidLevel label="デジタル基盤整備" color="7C95B5" textColor="1F3864" />
        <PyramidLevel label="アナログ業務中心" color="D8DFE8" textColor="1F3864" />
      </Pyramid>
    </VStack>

    <VStack w="max" gap="12">
      
      <HStack gap="6" alignItems="center">
        <Icon name="layout-grid" size="16" color="5B4380" />
        <Text fontSize="15" color="3D2E5B" bold="true">施策優先順位マトリクス</Text>
      </HStack>
      <Matrix w="max" h="320">
        <MatrixAxes x="実現容易性" y="ビジネスインパクト" />
        <MatrixQuadrants topLeft="戦略的投資" topRight="最優先実行" bottomLeft="様子見" bottomRight="即効施策" />
        <MatrixItem label="AI分析基盤" x="0.28" y="0.88" color="5B4380" />
        <MatrixItem label="顧客DX" x="0.58" y="0.92" color="3D2E5B" />
        <MatrixItem label="クラウド移行" x="0.78" y="0.78" color="4A3370" />
        <MatrixItem label="データ基盤" x="0.42" y="0.7" color="7560A0" />
        <MatrixItem label="RPA導入" x="0.82" y="0.46" color="2E4F7A" />
        <MatrixItem label="IoTセンサー" x="0.22" y="0.5" color="2E4F7A" />
        <MatrixItem label="社内SNS" x="0.62" y="0.24" color="7C95B5" />
        <MatrixItem label="ペーパーレス" x="0.86" y="0.28" color="4A6FA5" />
      </Matrix>
    </VStack>

  </HStack>

  <HStack w="max" gap="14" alignItems="start">
    
    <VStack w="max" gap="8">
      <HStack gap="6" alignItems="center">
        <Icon name="calendar" size="16" color="4A3370" />
        <Text fontSize="15" color="3D2E5B" bold="true">年次マイルストーン</Text>
      </HStack>
      <Timeline w="max" h="120" direction="horizontal">
        <TimelineItem date="2025 Q2" title="基盤構築完了" description="クラウド移行・データ基盤" color="C2BBD3" />
        <TimelineItem date="2026 Q1" title="RPA全社展開" description="50業務の自動化達成" color="9D8FB8" />
        <TimelineItem date="2027 Q1" title="AI分析稼働" description="予測分析・意思決定支援" color="5B4380" />
        <TimelineItem date="2028 Q2" title="データ駆動経営" description="KPIダッシュボード全社導入" color="3D2E5B" />
        <TimelineItem date="2029 Q4" title="自律進化達成" description="継続的イノベーション体制" color="2E2447" />
      </Timeline>
    </VStack>

  </HStack>

  <HStack w="max" gap="16" justifyContent="center">
    <HStack gap="6" alignItems="center">
      <Icon name="target" size="18" color="FFFFFF" variant="circle-filled" bgColor="5B4380" w="28" h="28" />
      <VStack gap="1">
        <Text fontSize="11" color="3D2E5B" bold="true">目標ROI</Text>
        <Text fontSize="13" color="2D2D40" bold="true">300%（5年累計）</Text>
      </VStack>
    </HStack>
    <HStack gap="6" alignItems="center">
      <Icon name="users" size="18" color="FFFFFF" variant="circle-filled" bgColor="2E4F7A" w="28" h="28" />
      <VStack gap="1">
        <Text fontSize="11" color="1F3864" bold="true">対象部門</Text>
        <Text fontSize="13" color="2D2D40" bold="true">全12部門・2,400名</Text>
      </VStack>
    </HStack>
    <HStack gap="6" alignItems="center">
      <Icon name="zap" size="18" color="FFFFFF" variant="circle-filled" bgColor="4A3370" w="28" h="28" />
      <VStack gap="1">
        <Text fontSize="11" color="3D2E5B" bold="true">業務効率化</Text>
        <Text fontSize="13" color="2D2D40" bold="true">年間40,000時間削減</Text>
      </VStack>
    </HStack>
    <HStack gap="6" alignItems="center">
      <Icon name="shield-check" size="18" color="FFFFFF" variant="circle-filled" bgColor="2E4F7A" w="28" h="28" />
      <VStack gap="1">
        <Text fontSize="11" color="2E4F7A" bold="true">セキュリティ</Text>
        <Text fontSize="13" color="2D2D40" bold="true">ゼロトラスト完全移行</Text>
      </VStack>
    </HStack>
  </HStack>

  <HStack w="max" justifyContent="spaceBetween" alignItems="center">
    <Text fontSize="9" color="8B8B95">※本ロードマップは経営戦略会議承認済み（2025年4月改訂版）</Text>
    <Text fontSize="9" color="6E7282">DX推進本部｜Corporate Digital Transformation Office</Text>
  </HStack>

</VStack>`,
  },
];

export const DEFAULT_TEMPLATE = SAMPLE_TEMPLATES[0];
