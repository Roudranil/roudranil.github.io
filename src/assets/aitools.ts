import type { AIToolIcons } from "../types";
import gpt from "@lobehub/icons-static-svg/icons/openai.svg?raw";
import claude from "@lobehub/icons-static-svg/icons/claude.svg?raw";
import gemini from "@lobehub/icons-static-svg/icons/gemini.svg?raw";
import grok from "@lobehub/icons-static-svg/icons/grok.svg?raw";
import qwen from "@lobehub/icons-static-svg/icons/qwen.svg?raw";
import deepseek from "@lobehub/icons-static-svg/icons/deepseek.svg?raw";

const aiTools: AIToolIcons = {
    gpt: { name: "GPT", icon: gpt },
    claude: { name: "Claude", icon: claude },
    gemini: { name: "Gemini", icon: gemini },
    grok: { name: "Grok", icon: grok },
    qwen: { name: "Qwen", icon: qwen },
    deepseek: { name: "DeepSeek", icon: deepseek },
};

export default aiTools;
