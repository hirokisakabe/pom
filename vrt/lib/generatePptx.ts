import { POMNode, buildPptx } from "../../src";

const palette = {
  background: "F8FAFC",
  navy: "0F172A",
  blue: "1D4ED8",
  lightBlue: "DBEAFE",
  accent: "0EA5E9",
  border: "E2E8F0",
  charcoal: "1E293B",
};

// Page 1: Basic layout components (vstack, hstack, box, text, shape)
const page1: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 24,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "box",
      padding: 20,
      backgroundColor: palette.navy,
      border: { color: palette.navy, width: 2 },
      children: {
        type: "hstack",
        justifyContent: "spaceBetween",
        alignItems: "center",
        children: [
          {
            type: "vstack",
            gap: 4,
            children: [
              {
                type: "text",
                text: "TEST_COMPANY",
                fontPx: 26,
                color: "FFFFFF",
              },
              {
                type: "text",
                text: "TEST_SUBTITLE / TEST_DATE",
                fontPx: 14,
                color: "E2E8F0",
              },
            ],
          },
          {
            type: "text",
            text: "TEST_LABEL",
            fontPx: 16,
            color: "FDE68A",
          },
        ],
      },
    },
    {
      type: "vstack",
      gap: 12,
      padding: 24,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 2 },
      children: [
        {
          type: "text",
          text: "TEST_TITLE",
          fontPx: 40,
          color: palette.charcoal,
          bold: true,
        },
        {
          type: "text",
          text: "TEST_DESCRIPTION_LINE_1",
          fontPx: 20,
          color: palette.blue,
        },
        {
          type: "hstack",
          gap: 18,
          alignItems: "center",
          children: [
            {
              type: "shape",
              shapeType: "rect",
              w: 60,
              h: 4,
              fill: { color: palette.blue },
            },
            {
              type: "text",
              text: "TEST_DATE_2",
              fontPx: 14,
              color: palette.charcoal,
            },
          ],
        },
      ],
    },
    {
      type: "hstack",
      gap: 20,
      alignItems: "start",
      children: [
        {
          type: "box",
          w: "60%",
          padding: 20,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 2 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "TEST_SECTION_A",
                fontPx: 18,
                color: palette.charcoal,
                bold: true,
                fontFamily: "Noto Sans JP",
              },
              {
                type: "text",
                text: "・TEST_BULLET_1\n・TEST_BULLET_2\n・TEST_BULLET_3",
                fontPx: 14,
                color: palette.charcoal,
                lineSpacingMultiple: 1.5,
              },
              {
                type: "shape",
                shapeType: "rect",
                w: "100%",
                h: 1,
                fill: { color: palette.border },
              },
              {
                type: "text",
                text: "TEST_SECTION_B",
                fontPx: 18,
                color: palette.charcoal,
              },
              {
                type: "text",
                text: "・TEST_BULLET_4\n・TEST_BULLET_5",
                fontPx: 14,
              },
            ],
          },
        },
        {
          type: "vstack",
          w: "40%",
          gap: 12,
          children: [
            {
              type: "box",
              padding: 18,
              backgroundColor: palette.lightBlue,
              border: { color: palette.blue, width: 2 },
              children: {
                type: "vstack",
                gap: 8,
                children: [
                  {
                    type: "text",
                    text: "TEST_METRIC_LABEL",
                    fontPx: 14,
                    color: palette.blue,
                  },
                  {
                    type: "text",
                    text: "TEST_AMOUNT",
                    fontPx: 28,
                    color: palette.navy,
                  },
                  {
                    type: "text",
                    text: "TEST_CHANGE +8%",
                    fontPx: 12,
                    color: palette.charcoal,
                  },
                ],
              },
            },
            {
              type: "box",
              padding: 18,
              backgroundColor: "FFFFFF",
              border: { color: palette.border, width: 2 },
              children: {
                type: "vstack",
                gap: 6,
                children: [
                  {
                    type: "text",
                    text: "TEST_LIST_HEADER",
                    fontPx: 14,
                    color: palette.charcoal,
                  },
                  {
                    type: "text",
                    text: "1. TEST_ITEM_A\n2. TEST_ITEM_B\n3. TEST_ITEM_C",
                    fontPx: 13,
                  },
                ],
              },
            },
            {
              type: "box",
              padding: 18,
              backgroundColor: "FFFFFF",
              border: { color: palette.border, width: 2 },
              children: {
                type: "hstack",
                gap: 10,
                alignItems: "center",
                children: [
                  {
                    type: "shape",
                    shapeType: "ellipse",
                    w: 60,
                    h: 60,
                    text: "ABC",
                    fontPx: 16,
                    fill: { color: palette.lightBlue },
                    line: { color: palette.blue, width: 2 },
                  },
                  {
                    type: "text",
                    text: "TEST_SHAPE_DESCRIPTION",
                    fontPx: 13,
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      type: "box",
      padding: 20,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 2 },
      children: {
        type: "vstack",
        gap: 10,
        children: [
          {
            type: "text",
            text: "TEST_SUMMARY_HEADER",
            fontPx: 18,
            color: palette.charcoal,
          },
          {
            type: "text",
            text: "・TEST_SUMMARY_POINT_1",
            fontPx: 13,
          },
          {
            type: "text",
            text: "・TEST_SUMMARY_POINT_2",
            fontPx: 13,
          },
          {
            type: "text",
            text: "・TEST_SUMMARY_POINT_3",
            fontPx: 13,
          },
          {
            type: "text",
            text: "・TEST_SUMMARY_POINT_4",
            fontPx: 13,
          },
        ],
      },
    },
    {
      type: "hstack",
      gap: 16,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "50%",
          padding: 18,
          backgroundColor: palette.lightBlue,
          border: { color: palette.blue, width: 2 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              {
                type: "text",
                text: "TEST_BOX_A_TITLE",
                fontPx: 16,
                color: palette.navy,
              },
              {
                type: "text",
                text: "・TEST_BOX_A_LINE_1\n・TEST_BOX_A_LINE_2\n・TEST_BOX_A_LINE_3",
                fontPx: 13,
              },
            ],
          },
        },
        {
          type: "box",
          w: "50%",
          padding: 18,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 2 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              {
                type: "text",
                text: "TEST_BOX_B_TITLE",
                fontPx: 16,
                color: palette.charcoal,
              },
              {
                type: "text",
                text: "・TEST_BOX_B_LINE_1\n・TEST_BOX_B_LINE_2\n・TEST_BOX_B_LINE_3",
                fontPx: 13,
              },
            ],
          },
        },
      ],
    },
    {
      type: "text",
      text: "TEST_FOOTER_TEXT / TEST_UPDATE_DATE",
      fontPx: 12,
      color: palette.charcoal,
    },
  ],
};

// Page 2: Table and complex nested layout
const page2: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 24,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "box",
      padding: 18,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 2 },
      children: {
        type: "hstack",
        gap: 16,
        alignItems: "center",
        children: [
          {
            type: "shape",
            shapeType: "rect",
            w: 8,
            h: 60,
            fill: { color: palette.blue },
          },
          {
            type: "text",
            text: "TEST_PAGE_2_HEADER",
            fontPx: 28,
            color: palette.charcoal,
          },
        ],
      },
    },
    {
      type: "hstack",
      gap: 24,
      alignItems: "start",
      children: [
        {
          type: "box",
          w: "55%",
          padding: 20,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 2 },
          children: {
            type: "vstack",
            gap: 16,
            children: [
              {
                type: "text",
                text: "TEST_TABLE_TITLE",
                fontPx: 18,
                color: palette.charcoal,
              },
              {
                type: "table",
                defaultRowHeight: 36,
                columns: [{ width: 80 }, { width: 230 }, { width: 120 }],
                rows: [
                  {
                    cells: [
                      {
                        text: "COL_A",
                        fontPx: 14,
                        bold: true,
                        backgroundColor: palette.lightBlue,
                      },
                      {
                        text: "COL_B",
                        fontPx: 14,
                        bold: true,
                        backgroundColor: palette.lightBlue,
                      },
                      {
                        text: "COL_C",
                        fontPx: 14,
                        bold: true,
                        backgroundColor: palette.lightBlue,
                      },
                    ],
                  },
                  {
                    cells: [
                      { text: "ROW_1_A", fontPx: 13 },
                      { text: "ROW_1_B", fontPx: 13 },
                      { text: "ROW_1_C", fontPx: 13 },
                    ],
                  },
                  {
                    cells: [
                      { text: "ROW_2_A", fontPx: 13 },
                      { text: "ROW_2_B", fontPx: 13 },
                      { text: "ROW_2_C", fontPx: 13 },
                    ],
                  },
                  {
                    cells: [
                      { text: "ROW_3_A", fontPx: 13 },
                      { text: "ROW_3_B", fontPx: 13 },
                      { text: "ROW_3_C", fontPx: 13 },
                    ],
                  },
                  {
                    cells: [
                      { text: "ROW_4_A", fontPx: 13 },
                      { text: "ROW_4_B", fontPx: 13 },
                      { text: "ROW_4_C", fontPx: 13 },
                    ],
                  },
                  {
                    cells: [
                      { text: "ROW_5_A", fontPx: 13 },
                      { text: "ROW_5_B", fontPx: 13 },
                      { text: "ROW_5_C", fontPx: 13 },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          type: "vstack",
          w: "45%",
          gap: 18,
          children: [
            {
              type: "box",
              padding: 20,
              backgroundColor: "FFFFFF",
              border: { color: palette.border, width: 2 },
              children: {
                type: "vstack",
                gap: 10,
                children: [
                  {
                    type: "text",
                    text: "TEST_NESTED_SECTION_A",
                    fontPx: 18,
                    color: palette.charcoal,
                  },
                  {
                    type: "text",
                    text: "・TEST_NESTED_LINE_1\n・TEST_NESTED_LINE_2\n・TEST_NESTED_LINE_3",
                    fontPx: 13,
                  },
                ],
              },
            },
            {
              type: "box",
              padding: 18,
              backgroundColor: palette.lightBlue,
              border: { color: palette.blue, width: 2 },
              children: {
                type: "hstack",
                gap: 12,
                alignItems: "center",
                children: [
                  {
                    type: "shape",
                    shapeType: "triangle",
                    w: 40,
                    h: 40,
                    fill: { color: palette.blue },
                    line: { color: palette.blue, width: 2 },
                  },
                  {
                    type: "text",
                    text: "TEST_TRIANGLE_SHAPE_TEXT",
                    fontPx: 14,
                    color: palette.navy,
                  },
                ],
              },
            },
            {
              type: "box",
              padding: 18,
              backgroundColor: "FFFFFF",
              border: { color: palette.border, width: 2 },
              children: {
                type: "vstack",
                gap: 8,
                children: [
                  {
                    type: "text",
                    text: "TEST_NESTED_SECTION_B",
                    fontPx: 16,
                    color: palette.charcoal,
                  },
                  {
                    type: "text",
                    text: "1. TEST_OPTION_A / 2. TEST_OPTION_B / 3. TEST_OPTION_C",
                    fontPx: 13,
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      type: "hstack",
      gap: 18,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "55%",
          padding: 20,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 2 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              {
                type: "text",
                text: "TEST_DETAIL_SECTION_A",
                fontPx: 18,
                color: palette.charcoal,
              },
              {
                type: "text",
                text: "・TEST_DETAIL_A_LINE_1\n・TEST_DETAIL_A_LINE_2\n・TEST_DETAIL_A_LINE_3",
                fontPx: 13,
              },
              {
                type: "text",
                text: "・TEST_DETAIL_A_LINE_4",
                fontPx: 13,
              },
            ],
          },
        },
        {
          type: "box",
          w: "45%",
          padding: 20,
          backgroundColor: palette.lightBlue,
          border: { color: palette.blue, width: 2 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              {
                type: "text",
                text: "TEST_DETAIL_SECTION_B",
                fontPx: 18,
                color: palette.navy,
              },
              {
                type: "text",
                text: "・TEST_DETAIL_B_LINE_1\n・TEST_DETAIL_B_LINE_2\n・TEST_DETAIL_B_LINE_3",
                fontPx: 13,
              },
              {
                type: "text",
                text: "・TEST_DETAIL_B_LINE_4",
                fontPx: 13,
              },
            ],
          },
        },
      ],
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 2 },
      children: {
        type: "text",
        text: "TEST_PAGE_2_FOOTER_NOTE",
        fontPx: 12,
        color: palette.charcoal,
      },
    },
  ],
};

// Page 3: Multiple boxes and shape types
const page3: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 24,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "TEST_PAGE_3_HEADER",
      fontPx: 28,
      color: palette.charcoal,
    },
    {
      type: "hstack",
      gap: 20,
      alignItems: "stretch",
      children: [
        {
          type: "vstack",
          w: "55%",
          gap: 16,
          children: [
            {
              type: "box",
              padding: 18,
              backgroundColor: "FFFFFF",
              border: { color: palette.border, width: 2 },
              children: {
                type: "vstack",
                gap: 8,
                children: [
                  {
                    type: "text",
                    text: "TEST_CARD_1_TITLE",
                    fontPx: 16,
                    color: palette.charcoal,
                  },
                  {
                    type: "text",
                    text: "TEST_CARD_1_DESCRIPTION",
                    fontPx: 13,
                  },
                  {
                    type: "text",
                    text: "KPI: TEST_KPI_VALUE_1",
                    fontPx: 12,
                    color: palette.blue,
                  },
                ],
              },
            },
            {
              type: "box",
              padding: 18,
              backgroundColor: "FFFFFF",
              border: { color: palette.border, width: 2 },
              children: {
                type: "vstack",
                gap: 8,
                children: [
                  {
                    type: "text",
                    text: "TEST_CARD_2_TITLE",
                    fontPx: 16,
                    color: palette.charcoal,
                  },
                  {
                    type: "text",
                    text: "TEST_CARD_2_DESCRIPTION",
                    fontPx: 13,
                  },
                  {
                    type: "text",
                    text: "KPI: TEST_KPI_VALUE_2",
                    fontPx: 12,
                    color: palette.blue,
                  },
                ],
              },
            },
            {
              type: "box",
              padding: 18,
              backgroundColor: "FFFFFF",
              border: { color: palette.border, width: 2 },
              children: {
                type: "vstack",
                gap: 8,
                children: [
                  {
                    type: "text",
                    text: "TEST_CARD_3_TITLE",
                    fontPx: 16,
                    color: palette.charcoal,
                  },
                  {
                    type: "text",
                    text: "TEST_CARD_3_DESCRIPTION",
                    fontPx: 13,
                  },
                  {
                    type: "text",
                    text: "KPI: TEST_KPI_VALUE_3",
                    fontPx: 12,
                    color: palette.blue,
                  },
                ],
              },
            },
          ],
        },
        {
          type: "box",
          w: "45%",
          padding: 20,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 2 },
          children: {
            type: "vstack",
            gap: 14,
            children: [
              {
                type: "text",
                text: "TEST_METRICS_TITLE",
                fontPx: 18,
                color: palette.charcoal,
              },
              {
                type: "table",
                defaultRowHeight: 34,
                columns: [{ width: 160 }, { width: 120 }],
                rows: [
                  {
                    cells: [
                      {
                        text: "METRIC_COL_A",
                        fontPx: 14,
                        bold: true,
                        backgroundColor: palette.lightBlue,
                      },
                      {
                        text: "METRIC_COL_B",
                        fontPx: 14,
                        bold: true,
                        backgroundColor: palette.lightBlue,
                      },
                    ],
                  },
                  {
                    cells: [
                      { text: "METRIC_1_NAME", fontPx: 12 },
                      { text: "0.12%", fontPx: 12 },
                    ],
                  },
                  {
                    cells: [
                      { text: "METRIC_2_NAME", fontPx: 12 },
                      { text: "55%", fontPx: 12 },
                    ],
                  },
                  {
                    cells: [
                      { text: "METRIC_3_NAME", fontPx: 12 },
                      { text: "-20%", fontPx: 12 },
                    ],
                  },
                  {
                    cells: [
                      { text: "METRIC_4_NAME", fontPx: 12 },
                      { text: "0", fontPx: 12 },
                    ],
                  },
                  {
                    cells: [
                      { text: "METRIC_5_NAME", fontPx: 12 },
                      { text: "95%", fontPx: 12 },
                    ],
                  },
                ],
              },
              {
                type: "vstack",
                gap: 6,
                children: [
                  {
                    type: "text",
                    text: "TEST_EVALUATION_LABEL",
                    fontPx: 16,
                    color: palette.charcoal,
                  },
                  {
                    type: "text",
                    text: "TEST_EVALUATION_DESCRIPTION",
                    fontPx: 12,
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      type: "box",
      padding: 20,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 2 },
      children: {
        type: "vstack",
        gap: 10,
        children: [
          {
            type: "text",
            text: "TEST_DETAIL_TITLE",
            fontPx: 18,
            color: palette.charcoal,
          },
          {
            type: "text",
            text: "TEST_DETAIL_PARAGRAPH_1",
            fontPx: 13,
          },
          {
            type: "text",
            text: "TEST_DETAIL_PARAGRAPH_2",
            fontPx: 13,
          },
          {
            type: "text",
            text: "TEST_DETAIL_PARAGRAPH_3",
            fontPx: 13,
          },
          {
            type: "text",
            text: "TEST_DETAIL_PARAGRAPH_4",
            fontPx: 13,
          },
          {
            type: "text",
            text: "TEST_DETAIL_PARAGRAPH_5",
            fontPx: 13,
          },
        ],
      },
    },
    {
      type: "box",
      padding: 20,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 2 },
      children: {
        type: "hstack",
        gap: 18,
        alignItems: "start",
        children: [
          {
            type: "vstack",
            w: "55%",
            gap: 8,
            children: [
              {
                type: "text",
                text: "TEST_LEFT_COLUMN_TITLE",
                fontPx: 16,
                color: palette.charcoal,
              },
              {
                type: "text",
                text: "・TEST_LEFT_LINE_1\n・TEST_LEFT_LINE_2",
                fontPx: 13,
              },
              {
                type: "text",
                text: "・TEST_LEFT_LINE_3",
                fontPx: 13,
              },
            ],
          },
          {
            type: "vstack",
            w: "45%",
            gap: 8,
            children: [
              {
                type: "text",
                text: "TEST_RIGHT_COLUMN_TITLE",
                fontPx: 16,
                color: palette.charcoal,
              },
              {
                type: "text",
                text: "1. TEST_RIGHT_ITEM_1\n2. TEST_RIGHT_ITEM_2\n3. TEST_RIGHT_ITEM_3",
                fontPx: 13,
              },
              {
                type: "text",
                text: "TEST_RIGHT_NOTE",
                fontPx: 13,
              },
            ],
          },
        ],
      },
    },
    {
      type: "box",
      padding: 18,
      backgroundColor: palette.lightBlue,
      border: { color: palette.blue, width: 2 },
      children: {
        type: "text",
        text: "TEST_PAGE_3_FOOTER_NOTE",
        fontPx: 13,
        color: palette.navy,
      },
    },
  ],
};

// Page 4: Roadmap and RACI matrix representation
const page4: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 24,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "TEST_PAGE_4_HEADER",
      fontPx: 28,
      color: palette.charcoal,
    },
    {
      type: "hstack",
      gap: 20,
      alignItems: "start",
      children: [
        {
          type: "box",
          w: "60%",
          padding: 22,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 2 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "TEST_ROADMAP_TITLE",
                fontPx: 18,
                color: palette.charcoal,
              },
              {
                type: "vstack",
                gap: 10,
                children: [
                  {
                    type: "hstack",
                    gap: 10,
                    alignItems: "center",
                    children: [
                      {
                        type: "shape",
                        shapeType: "ellipse",
                        w: 34,
                        h: 34,
                        text: "Q1",
                        fontPx: 14,
                        fill: { color: palette.lightBlue },
                        line: { color: palette.blue, width: 2 },
                      },
                      {
                        type: "text",
                        text: "TEST_Q1_DESCRIPTION",
                        fontPx: 13,
                      },
                    ],
                  },
                  {
                    type: "hstack",
                    gap: 10,
                    alignItems: "center",
                    children: [
                      {
                        type: "shape",
                        shapeType: "ellipse",
                        w: 34,
                        h: 34,
                        text: "Q2",
                        fontPx: 14,
                        fill: { color: "FFFFFF" },
                        line: { color: palette.blue, width: 2 },
                      },
                      {
                        type: "text",
                        text: "TEST_Q2_DESCRIPTION",
                        fontPx: 13,
                      },
                    ],
                  },
                  {
                    type: "hstack",
                    gap: 10,
                    alignItems: "center",
                    children: [
                      {
                        type: "shape",
                        shapeType: "ellipse",
                        w: 34,
                        h: 34,
                        text: "Q3",
                        fontPx: 14,
                        fill: { color: palette.lightBlue },
                        line: { color: palette.blue, width: 2 },
                      },
                      {
                        type: "text",
                        text: "TEST_Q3_DESCRIPTION",
                        fontPx: 13,
                      },
                    ],
                  },
                  {
                    type: "hstack",
                    gap: 10,
                    alignItems: "center",
                    children: [
                      {
                        type: "shape",
                        shapeType: "ellipse",
                        w: 34,
                        h: 34,
                        text: "Q4",
                        fontPx: 14,
                        fill: { color: "FFFFFF" },
                        line: { color: palette.blue, width: 2 },
                      },
                      {
                        type: "text",
                        text: "TEST_Q4_DESCRIPTION",
                        fontPx: 13,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          type: "vstack",
          w: "40%",
          gap: 16,
          children: [
            {
              type: "box",
              padding: 20,
              backgroundColor: "FFFFFF",
              border: { color: palette.border, width: 2 },
              children: {
                type: "vstack",
                gap: 8,
                children: [
                  {
                    type: "text",
                    text: "TEST_STRUCTURE_TITLE",
                    fontPx: 18,
                    color: palette.charcoal,
                  },
                  {
                    type: "text",
                    text: "・TEST_ROLE_A: TEST_ROLE_A_DESC\n・TEST_ROLE_B: TEST_ROLE_B_DESC\n・TEST_ROLE_C: TEST_ROLE_C_DESC",
                    fontPx: 13,
                  },
                ],
              },
            },
            {
              type: "box",
              padding: 18,
              backgroundColor: palette.lightBlue,
              border: { color: palette.blue, width: 2 },
              children: {
                type: "vstack",
                gap: 8,
                children: [
                  {
                    type: "text",
                    text: "TEST_GOVERNANCE_TITLE",
                    fontPx: 16,
                    color: palette.navy,
                  },
                  {
                    type: "text",
                    text: "TEST_GOVERNANCE_DESCRIPTION",
                    fontPx: 12,
                    color: palette.navy,
                  },
                ],
              },
            },
            {
              type: "box",
              padding: 18,
              backgroundColor: "FFFFFF",
              border: { color: palette.border, width: 2 },
              children: {
                type: "vstack",
                gap: 8,
                children: [
                  {
                    type: "text",
                    text: "TEST_ACTION_TITLE",
                    fontPx: 16,
                    color: palette.charcoal,
                  },
                  {
                    type: "text",
                    text: "TEST_ACTION_DESCRIPTION",
                    fontPx: 12,
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      type: "box",
      padding: 20,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 2 },
      children: {
        type: "hstack",
        gap: 18,
        alignItems: "start",
        children: [
          {
            type: "vstack",
            w: "55%",
            gap: 10,
            children: [
              {
                type: "text",
                text: "TEST_RACI_TITLE",
                fontPx: 18,
                color: palette.charcoal,
              },
              {
                type: "text",
                text: "R: TEST_R_ROLE, A: TEST_A_ROLE, C: TEST_C_ROLE, I: TEST_I_ROLE\nTEST_RACI_NOTE",
                fontPx: 13,
              },
              {
                type: "text",
                text: "TEST_RACI_ADDITIONAL_NOTE",
                fontPx: 13,
              },
            ],
          },
          {
            type: "vstack",
            w: "45%",
            gap: 10,
            children: [
              {
                type: "text",
                text: "TEST_DELIVERABLES_TITLE",
                fontPx: 18,
                color: palette.charcoal,
              },
              {
                type: "text",
                text: "・TEST_DELIVERABLE_1\n・TEST_DELIVERABLE_2\n・TEST_DELIVERABLE_3\n・TEST_DELIVERABLE_4",
                fontPx: 13,
              },
              {
                type: "text",
                text: "TEST_DELIVERABLES_NOTE",
                fontPx: 13,
              },
            ],
          },
        ],
      },
    },
    {
      type: "text",
      text: "TEST_CONTACT_INFO / TEST_EMAIL_ADDRESS",
      fontPx: 12,
      color: palette.charcoal,
    },
  ],
};

// Page 5: Chart examples
const page5: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 24,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "TEST_PAGE_5_HEADER - Charts",
      fontPx: 28,
      color: palette.charcoal,
    },
    {
      type: "hstack",
      gap: 20,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "50%",
          padding: 20,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 2 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Bar Chart",
                fontPx: 18,
                color: palette.charcoal,
              },
              {
                type: "chart",
                chartType: "bar",
                w: 500,
                h: 200,
                data: [
                  {
                    name: "Sales",
                    labels: ["Q1", "Q2", "Q3", "Q4"],
                    values: [100, 200, 150, 300],
                  },
                  {
                    name: "Profit",
                    labels: ["Q1", "Q2", "Q3", "Q4"],
                    values: [30, 60, 45, 90],
                  },
                ],
                showLegend: true,
                chartColors: ["0088CC", "00AA00"],
              },
            ],
          },
        },
        {
          type: "box",
          w: "50%",
          padding: 20,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 2 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Line Chart",
                fontPx: 18,
                color: palette.charcoal,
              },
              {
                type: "chart",
                chartType: "line",
                w: 500,
                h: 200,
                data: [
                  {
                    name: "Revenue",
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    values: [50, 80, 60, 120, 100, 150],
                  },
                ],
                showLegend: true,
                chartColors: ["1D4ED8"],
              },
            ],
          },
        },
      ],
    },
    {
      type: "hstack",
      gap: 20,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "50%",
          padding: 20,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 2 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Pie Chart",
                fontPx: 18,
                color: palette.charcoal,
              },
              {
                type: "chart",
                chartType: "pie",
                w: 500,
                h: 200,
                data: [
                  {
                    name: "Market Share",
                    labels: ["Product A", "Product B", "Product C", "Others"],
                    values: [40, 30, 20, 10],
                  },
                ],
                showLegend: true,
                showTitle: true,
                title: "Market Share",
                chartColors: ["0088CC", "00AA00", "FF6600", "888888"],
              },
            ],
          },
        },
        {
          type: "box",
          w: "50%",
          padding: 20,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 2 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Bar Chart with Title",
                fontPx: 18,
                color: palette.charcoal,
              },
              {
                type: "chart",
                chartType: "bar",
                w: 500,
                h: 200,
                data: [
                  {
                    name: "2023",
                    labels: ["North", "South", "East", "West"],
                    values: [250, 180, 220, 150],
                  },
                  {
                    name: "2024",
                    labels: ["North", "South", "East", "West"],
                    values: [300, 200, 250, 180],
                  },
                ],
                showLegend: true,
                showTitle: true,
                title: "Regional Sales",
                chartColors: ["1D4ED8", "0EA5E9"],
              },
            ],
          },
        },
      ],
    },
  ],
};

export async function generatePptx(outputPath: string): Promise<void> {
  const pptx = await buildPptx(
    [page1, page2, page3, page4, page5],
    {
      w: 1280,
      h: 720,
    },
    {
      master: {
        header: {
          type: "hstack",
          h: 40,
          padding: { left: 48, right: 48, top: 12, bottom: 0 },
          justifyContent: "spaceBetween",
          alignItems: "center",
          backgroundColor: palette.navy,
          children: [
            {
              type: "text",
              text: "TEST_COMPANY",
              fontPx: 14,
              color: "FFFFFF",
            },
            {
              type: "text",
              text: "{{date}}",
              fontPx: 12,
              color: "E2E8F0",
            },
          ],
        },
        footer: {
          type: "hstack",
          h: 30,
          padding: { left: 48, right: 48, top: 0, bottom: 8 },
          justifyContent: "spaceBetween",
          alignItems: "center",
          children: [
            {
              type: "text",
              text: "TEST_LABEL",
              fontPx: 10,
              color: palette.charcoal,
            },
            {
              type: "text",
              text: "Page {{page}} / {{totalPages}}",
              fontPx: 10,
              color: palette.charcoal,
              alignText: "right",
            },
          ],
        },
        date: {
          format: "YYYY/MM/DD",
        },
      },
    },
  );

  await pptx.writeFile({ fileName: outputPath });
}
