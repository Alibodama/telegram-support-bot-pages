export async function onRequestPost(context) {
  const request = context.request;
  const update = await request.json();

  // اگر این یک ریپلای تیکت (از سمت ادمین) باشه، رد کن
  if (!update.message || !update.message.text) {
    return new Response('OK', { status: 200 });
  }

  const chatId = update.message.chat.id;
  const messageText = update.message.text;
  const firstName = update.message.from.first_name || 'کاربر';
  const lastName = update.message.from.last_name || '';
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;
  const botToken = context.env.BOT_TOKEN;
  const adminChatId = context.env.ADMIN_ID;

  let responseText = '';

  if (chatId.toString() !== adminChatId) {
    // کاربر عادی (تیکت جدید)
    if (messageText === '/start') {
      responseText = `😍 به پشتیبانی ربات تورنادو خوش اومدی ${fullName} ! 😘\n\n` +
                     `من همیشه اینجا هستم تا بهت کمک کنم 🦸‍♂️\n` +
                     `هر سؤال ، مشکل یا پیشنهادی داری ، فقط بگو ! 🚀🔥\n\n` +
                     `🆔 آیدی تو : <code>${chatId}</code> (روی آیدی بزن تا کپی بشه) \n\n` +
                     `💬 حالا پیام خودتو بفرست – منتظرم ! 😊🌈`;
    } else {
      // فرستادن تیکت به ادمین
      const forwardText = `📩 تیکت جدید از ${fullName} (ID: ${chatId}):\n\n${messageText}`;
      await sendMessage(adminChatId, forwardText, botToken);

      responseText = `✅ ممنون ${fullName} ! پیامت رو دریافت کردم و به زودی بررسی می‌شه . 🌟\n` +
                     `اگر جزئیات بیشتری داری ، بفرست ! 📝😉`;
    }
  } else {
    // ادمین (پاسخ به تیکت)
    if (update.message.reply_to_message) {
      const repliedMessage = update.message.reply_to_message.text || '';
      const userIdMatch = repliedMessage.match(/ID: (\d+)/);
      
      if (userIdMatch && userIdMatch[1]) {
        const targetChatId = userIdMatch[1];
        const replyText = messageText;

        await sendMessage(targetChatId, `📬 پاسخ پشتیبانی: ${replyText} 😊`, botToken);
        responseText = `✅ پاسخ به کاربر ${targetChatId} ارسال شد. 🚀`;
      } else {
        responseText = '❌ آیدی پیدا نشد. لطفاً روی پیام تیکت ریپلای کن.';
      }
    } else {
      responseText = 'ℹ️ لطفاً روی پیام تیکت ریپلای کن تا به کاربر برسه.';
    }
  }

  await sendMessage(chatId.toString(), responseText, botToken);
  return new Response('OK', { status: 200 });
}

// ====================== تابع ارسال پیام ======================
async function sendMessage(chatId, text, token) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'   // خیلی بهتر از Markdown کار می‌کنه
    })
  });
}
