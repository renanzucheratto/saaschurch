"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import {
  Box,
  IconButton,
  Tooltip,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Popover,
} from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
}

const colors = [
  "#000000", "#545454", "#737373", "#A6A6A6", "#D9D9D9", "#FFFFFF",
  "#FF0000", "#FFC000", "#FFFF00", "#92D050", "#00B050", "#00B0F0",
  "#0070C0", "#002060", "#7030A0"
];

const MenuBar = ({ editor }: { editor: any }) => {
  const [colorAnchorEl, setColorAnchorEl] = useState<HTMLButtonElement | null>(null);

  if (!editor) return null;

  const handleColorClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setColorAnchorEl(event.currentTarget);
  };

  const handleColorClose = () => {
    setColorAnchorEl(null);
  };

  return (
    <Box
      sx={{
        p: 0.5,
        display: "flex",
        flexWrap: "wrap",
        gap: 0.5,
        borderBottom: "1px solid #E0E0E0",
        bgcolor: "#FAFAFA",
      }}
    >
      <Stack direction="row" spacing={0.5} divider={<Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />}>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Negrito">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              color={editor.isActive("bold") ? "primary" : "default"}
              sx={{ borderRadius: 1 }}
            >
              <IconifyIcon icon="material-symbols:format-bold" width={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Itálico">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              color={editor.isActive("italic") ? "primary" : "default"}
              sx={{ borderRadius: 1 }}
            >
              <IconifyIcon icon="material-symbols:format-italic" width={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sublinhado">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              color={editor.isActive("underline") ? "primary" : "default"}
              sx={{ borderRadius: 1 }}
            >
              <IconifyIcon icon="material-symbols:format-underlined" width={20} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Cor do Texto">
            <IconButton
              size="small"
              onClick={handleColorClick}
              sx={{ borderRadius: 1 }}
            >
              <IconifyIcon icon="material-symbols:format-color-text" width={20} color={editor.getAttributes("textStyle").color || "inherit"} />
            </IconButton>
          </Tooltip>
          <Popover
            open={Boolean(colorAnchorEl)}
            anchorEl={colorAnchorEl}
            onClose={handleColorClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          >
            <Box sx={{ p: 1, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0.5 }}>
              {colors.map((color) => (
                <IconButton
                  key={color}
                  size="small"
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    handleColorClose();
                  }}
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: color,
                    border: "1px solid #E0E0E0",
                    "&:hover": { bgcolor: color, opacity: 0.8 },
                  }}
                />
              ))}
              <Tooltip title="Remover Cor">
                <IconButton
                  size="small"
                  onClick={() => {
                    editor.chain().focus().unsetColor().run();
                    handleColorClose();
                  }}
                >
                  <IconifyIcon icon="material-symbols:format-color-reset" width={20} />
                </IconButton>
              </Tooltip>
            </Box>
          </Popover>

          <Tooltip title="Destaque">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              color={editor.isActive("highlight") ? "primary" : "default"}
              sx={{ borderRadius: 1 }}
            >
              <IconifyIcon icon="material-symbols:format-ink-highlighter" width={20} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Alinhamento Esquerda">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              color={editor.isActive({ textAlign: "left" }) ? "primary" : "default"}
              sx={{ borderRadius: 1 }}
            >
              <IconifyIcon icon="material-symbols:format-align-left" width={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Alinhamento Centro">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              color={editor.isActive({ textAlign: "center" }) ? "primary" : "default"}
              sx={{ borderRadius: 1 }}
            >
              <IconifyIcon icon="material-symbols:format-align-center" width={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Alinhamento Direita">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              color={editor.isActive({ textAlign: "right" }) ? "primary" : "default"}
              sx={{ borderRadius: 1 }}
            >
              <IconifyIcon icon="material-symbols:format-align-right" width={20} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Lista com Marcadores">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              color={editor.isActive("bulletList") ? "primary" : "default"}
              sx={{ borderRadius: 1 }}
            >
              <IconifyIcon icon="material-symbols:format-list-bulleted" width={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Lista Numerada">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              color={editor.isActive("orderedList") ? "primary" : "default"}
              sx={{ borderRadius: 1 }}
            >
              <IconifyIcon icon="material-symbols:format-list-numbered" width={20} />
            </IconButton>
          </Tooltip>
        </Box>
      </Stack>
    </Box>
  );
};

export default function RichTextEditor({ value, onChange, label, error, helperText }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Color,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <Box>
      {label && (
        <Box sx={{ mb: 1 }}>
          <Box component="span" sx={{ fontSize: "0.875rem", fontWeight: 500, color: error ? "#d32f2f" : "#666" }}>
            {label}
          </Box>
        </Box>
      )}
      <Box
        sx={{
          border: "1px solid",
          borderColor: error ? "#d32f2f" : "#E0E0E0",
          borderRadius: 1.5,
          overflow: "hidden",
          "&:focus-within": {
            borderColor: error ? "#d32f2f" : "#5B5FED",
            boxShadow: error ? "none" : "0 0 0 1px #5B5FED",
          },
          "& .tiptap": {
            p: 1.5,
            minHeight: 120,
            outline: "none",
            "& p": { m: 0 },
            "& ul, & ol": { pl: 3 },
          },
        }}
      >
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </Box>
      {helperText && (
        <Box sx={{ mt: 0.5, px: 1.5 }}>
          <Box component="span" sx={{ fontSize: "0.75rem", color: error ? "#d32f2f" : "#666" }}>
            {helperText}
          </Box>
        </Box>
      )}
    </Box>
  );
}
