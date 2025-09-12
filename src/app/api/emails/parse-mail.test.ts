import { parsePostmarkInboundEmail } from './parse-mail'

describe('parsePostmarkInboundEmail', () => {
  it('BCC a message to postmark', () => {
    const postMarkMail = {
      FromName: 'Trygve Amundsen',
      MessageStream: 'inbound',
      From: 'trygve@kodemaker.no',
      FromFull: {
        Email: 'trygve@kodemaker.no',
        Name: 'Trygve Amundsen',
        MailboxHash: '',
      },
      To: '"trygvea" <trygvea@gmail.com>',
      ToFull: [
        {
          Email: 'trygvea@gmail.com',
          Name: 'trygvea',
          MailboxHash: '',
        },
      ],
      Cc: '',
      CcFull: [],
      Bcc: '4bd2bba8259b7bf7fda7a600175ce1b3@inbound.postmarkapp.com',
      BccFull: [
        {
          Email: '4bd2bba8259b7bf7fda7a600175ce1b3@inbound.postmarkapp.com',
          Name: '',
          MailboxHash: '',
        },
      ],
      OriginalRecipient: '4bd2bba8259b7bf7fda7a600175ce1b3@inbound.postmarkapp.com',
      Subject: 'BCC til trygvea',
      MessageID: 'bbd76670-8726-4670-9dc7-af593d1608b6',
      ReplyTo: '',
      MailboxHash: '',
      Date: 'Thu, 11 Sep 2025 17:11:31 +0200',
      TextBody: 'Tekst, her\ner\ndet mye\nsnadder\n',
      HtmlBody:
        '<div dir="ltr">Tekst, her\u00a0<div>er<\/div><div>det mye<\/div><div>snadder<\/div><\/div>\n',
      StrippedTextReply: '',
    }

    const parsed = parsePostmarkInboundEmail(postMarkMail)

    expect(parsed.mode).toBe('BCC')
    if (parsed.mode === 'BCC') {
      expect(parsed).toEqual({
        mode: 'BCC',
        crmUser: 'trygve@kodemaker.no',
        contactEmail: 'trygvea@gmail.com',
        date: 'Thu, 11 Sep 2025 17:11:31 +0200',
        subject: 'BCC til trygvea',
        body: 'Tekst, her\ner\ndet mye\nsnadder\n',
      })
      expect(parsed.forwardComment).toBeUndefined()
    }
  })

  it('FORWARD a message to postmark', () => {
    const postMarkMail = {
      FromName: 'Trygve Amundsen',
      MessageStream: 'inbound',
      From: 'trygve@kodemaker.no',
      FromFull: {
        Email: 'trygve@kodemaker.no',
        Name: 'Trygve Amundsen',
        MailboxHash: '',
      },
      To: '4bd2bba8259b7bf7fda7a600175ce1b3@inbound.postmarkapp.com',
      ToFull: [
        {
          Email: '4bd2bba8259b7bf7fda7a600175ce1b3@inbound.postmarkapp.com',
          Name: '',
          MailboxHash: '',
        },
      ],
      Cc: '',
      CcFull: [],
      Bcc: '',
      BccFull: [],
      OriginalRecipient: '4bd2bba8259b7bf7fda7a600175ce1b3@inbound.postmarkapp.com',
      Subject: 'Fwd: Mail til trygvea fra trygve.amundsen',
      MessageID: '1356bdc5-004c-42b0-8f18-8fd5052dea65',
      ReplyTo: '',
      MailboxHash: '',
      Date: 'Thu, 11 Sep 2025 17:14:12 +0200',
      TextBody:
        '(Her er en melding fra trygve kodemaker, som var den som forwardet mailen)\n\n---------- Forwarded message ---------\nFrom: Trygve Amundsen <trygve.amundsen@gmail.com>\nDate: Thu, Sep 11, 2025 at 3:38\u202fPM\nSubject: Mail til trygvea fra trygve.amundsen\nTo: trygvea <trygvea@gmail.com>\n\n\nViktig mail (original body)\n',
      HtmlBody:
        '<div dir="ltr">(Her er en melding fra trygve kodemaker, som var den som forwardet mailen)<br><br><div class="gmail_quote gmail_quote_container"><div dir="ltr" class="gmail_attr">---------- Forwarded message ---------<br>From: <strong class="gmail_sendername" dir="auto">Trygve Amundsen<\/strong> <span dir="auto">&lt;<a href="mailto:trygve.amundsen@gmail.com">trygve.amundsen@gmail.com<\/a>&gt;<\/span><br>Date: Thu, Sep 11, 2025 at 3:38\u202fPM<br>Subject: Mail til trygvea fra trygve.amundsen<br>To: trygvea &lt;<a href="mailto:trygvea@gmail.com">trygvea@gmail.com<\/a>&gt;<br><\/div><br><br><div dir="ltr">Viktig mail (original body)<\/div>\n<\/div><\/div>\n',
      StrippedTextReply:
        '(Her er en melding fra trygve kodemaker, som var den som forwardet mailen)\n\n---------- Forwarded message ---------',
    }

    const parsed = parsePostmarkInboundEmail(postMarkMail)

    expect(parsed.mode).toBe('FORWARDED')
    if (parsed.mode === 'FORWARDED') {
      expect(parsed).toEqual({
        mode: 'FORWARDED',
        crmUser: 'trygve@kodemaker.no',
        contactEmail: 'trygve.amundsen@gmail.com',
        date: 'Thu, 11 Sep 2025 17:14:12 +0200',
        subject: 'Fwd: Mail til trygvea fra trygve.amundsen',
        body: 'Viktig mail (original body)',
        forwardComment:
          '(Her er en melding fra trygve kodemaker, som var den som forwardet mailen)',
      })
    }
  })
})
