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
      To: '"Kunde Knutsen" <kunde.knutsen@firma.com>',
      ToFull: [
        {
          Email: 'kunde.knutsen@firma.com',
          Name: 'Kunde Knutsen',
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
      Subject: 'Viktig melding',
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
        contactEmail: 'kunde.knutsen@firma.com',
        date: 'Thu, 11 Sep 2025 17:11:31 +0200',
        subject: 'Viktig melding',
        body: 'Tekst, her\ner\ndet mye\nsnadder\n',
      })
      expect(parsed.forwardComment).toBeUndefined()
    }
  })

})
