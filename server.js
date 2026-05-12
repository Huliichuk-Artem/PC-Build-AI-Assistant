import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import Groq from 'groq-sdk';
import { findPartInDB } from './db.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const tools = [
    {
        type: "function",
        function: {
            name: "getPartInfo",
            description: "Шукає деталь у базі даних. ВАЖЛИВО: передавай у partName ТІЛЬКИ точну назву моделі (наприклад, 'Ryzen 5 7600' або 'ASUS B650'). ЗАБОРОНЕНО додавати зайві слова, питання чи контекст.",
            parameters: {
                type: "object",
                properties: {
                    partName: { type: "string", description: "Точна коротка назва комплектуючої" }
                },
                required: ["partName"]
            }
        }
    }
];

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "Порожнє повідомлення" });

      const messages = [
    { 
        role: "system", 
        content: `Ти — технічний експерт зі збірки ПК. 
Твоя мета — давати МАКСИМАЛЬНО короткі, сухі та точні відповіді на основі бази даних. 
ПРАВИЛА:
1. Відповідай лише 1-2 реченнями.
2. Одразу давай вердикт (сумісно/несумісно) та вказуй причину (наприклад, спільний сокет AM5).
3. КАТЕГОРИЧНО ЗАБОРОНЕНО писати загальні поради, попередження (на кшталт "перевірте інформацію на сайті", "зверніть увагу на інші деталі") та лити "воду".
4. Відповідай виключно українською мовою.` 
    },
    { role: "user", content: message }
];

        let response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile", 
            messages: messages,
            tools: tools,
            tool_choice: "auto"
        });

        const responseMessage = response.choices[0].message;
        const toolCalls = responseMessage.tool_calls;

        if (toolCalls) {
            messages.push(responseMessage); 
            
            for (const toolCall of toolCalls) {
                if (toolCall.function.name === "getPartInfo") {
                    const args = JSON.parse(toolCall.function.arguments);
                    console.log(`--- Запит до БД (Groq) для: ${args.partName} ---`);
                    const dbResult = await findPartInDB(args.partName);
                    
                    messages.push({
                        tool_call_id: toolCall.id,
                        role: "tool",
                        name: "getPartInfo",
                        content: JSON.stringify(dbResult)
                    });
                }
            }

            const secondResponse = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: messages
            });
            return res.json({ response: secondResponse.choices[0].message.content });
        }

        res.json({ response: responseMessage.content });

    } catch (error) {
        console.error("Помилка генерації:", error);
        res.status(500).json({ error: "Вибачте, виникла технічна проблема. Спробуйте пізніше." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
