export async function onRequestPost(context) {
  const request = context.request;
  const update = await request.json();
  
  if (update.message && update.message.text) {
    const chatId = update.message.chat.id;
    const messageText = update.message.text;
    const firstName = update.message.from.first_name || 'کاربر';
    const lastName = update.message.from.last_name || '';
    const fullName = lastName ? `\( {firstName} \){lastName}` : firstName;
    const botToken = '8464936009:AAFoF_QYvtJhmGVT95osG15_BKef8h-D8Oo';
    const adminChatId = '6804185478';

    let responseText = '';
    
    if (chatId.toString() !== adminChatId) {
      if (messageText === '/start') {
        responseText = `😍✨ به پشتیبانی ربات تورنادو خوش اومدی، ${fullName}! 😘🌟\n\n` +
                       `من همیشه اینجا هستم تا بهت کمک کنم. 🦸‍♂️ هر سؤال، مشکل یا پیشنهادی داری، فقط بگو! 🚀🔥\n\n` +
                       `🆔 آیدی تو: <code>${chatId}</code> (بزن روش تا کپی بشه!) 📋\n\n` +
                       `💬 حالا پیام خودتو ارسال کن – منتظرم! 😊🌈`;
      } else {
        const forwardText = `📩 تیکت جدید از \( {fullName} (ID: \){chatId}):\n\n${messageText}`;
        await sendMessage(adminChatId, forwardText, botToken);
        responseText = `✅ ممنون ${fullName}! پیام‌ات رو دریافت کردیم و به زودی بررسی می‌شه. 🌟\nاگر جزئیات بیشتری داری، بفرست! 📝😉`;
      }
    } else {
      if (update.message.reply_to_message) {
        const repliedMessage = update.message.reply_to_message.text;
        const userIdMatch = repliedMessage.match(/ID: (\\d+)/);
        if (userIdMatch && userIdMatch[1]) {
          const targetChatId = userIdMatch[1];
          const replyText = messageText;
          await sendMessage(targetChatId, `📬 پاسخ پشتیبانی: ${replyText} 😊`, botToken);
          responseText = `✅ پاسخ به کاربر ${targetChatId} ارسال شد. 🚀`;
        } else {
          responseText = '❌ آیدی پیدا نشد. روی پیام تیکت ریپلای کن.';
        }
      } else {
        responseText = 'ℹ️ روی پیام تیکت ریپلای کن.';
      }
    }
    
    await sendMessage(chatId.toString(), responseText, botToken);
  }
  
  return new Response('OK', { status: 200 });
}

async function sendMessage(chatId, text, token) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' })
  });
}
