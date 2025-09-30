import { parsePostmarkInboundEmail } from './parse-mail'

describe('parsePostmarkInboundEmail', () => {
  it('FORWARD a message to postmark after receiving from customer', () => {
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
      Subject: 'Fwd: Viktig melding',
      MessageID: '1356bdc5-004c-42b0-8f18-8fd5052dea65',
      ReplyTo: '',
      MailboxHash: '',
      Date: 'Thu, 11 Sep 2025 17:14:12 +0200',
      TextBody: `
(Body lagt på ved forwarding)

---------- Forwarded message ---------
From: Kunde Knutsen <kunde.knutsen@gmail.com>
Date: Thu, Sep 11, 2025 at 3:38\u202fPM
Subject: Viktig melding
To: trygve <trygve@kodemaker.no>


Viktig melding (original body)
`,
      HtmlBody: '<div">Not used in this test</div>',
      StrippedTextReply:
        '(Body lagt på ved forwarding)\n\n---------- Forwarded message ---------',
    }

    const parsed = parsePostmarkInboundEmail(postMarkMail)

    expect(parsed.mode).toBe('FORWARDED')
    if (parsed.mode === 'FORWARDED') {
      expect(parsed).toEqual({
        mode: 'FORWARDED',
        crmUser: 'trygve@kodemaker.no',
        contactEmail: 'kunde.knutsen@gmail.com',
        date: 'Thu, 11 Sep 2025 17:14:12 +0200',
        subject: 'Fwd: Viktig melding',
        body: 'Viktig melding (original body)',
        forwardComment:
          '(Body lagt på ved forwarding)',
      })
    }
  })

  it('FORWARD a message that you sent to the customer earlier (but forgot to BCC)', () => {
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
      Subject: 'Fwd: Viktig melding',
      MessageID: '1356bdc5-004c-42b0-8f18-8fd5052dea65',
      ReplyTo: '',
      MailboxHash: '',
      Date: 'Thu, 11 Sep 2025 17:14:12 +0200',
      TextBody: `
(Body lagt på ved forwarding)

---------- Forwarded message ---------
From: Trygve Amundsen <trygve@kodemaker.no>
Date: Thu, Sep 11, 2025 at 3:38\u202fPM
Subject: Viktig melding
To: Kunde Knutsen <kunde.knutsen@gmail.com>


Viktig melding (original body)
`,
      HtmlBody: '<div">Not used in this test</div>',
      StrippedTextReply:
        '(Body lagt på ved forwarding)\n\n---------- Forwarded message ---------',
    }

    const parsed = parsePostmarkInboundEmail(postMarkMail)

    expect(parsed.mode).toBe('FORWARDED')
    if (parsed.mode === 'FORWARDED') {
      expect(parsed).toEqual({
        mode: 'FORWARDED',
        crmUser: 'trygve@kodemaker.no',
        contactEmail: 'kunde.knutsen@gmail.com',
        date: 'Thu, 11 Sep 2025 17:14:12 +0200',
        subject: 'Fwd: Viktig melding',
        body: 'Viktig melding (original body)',
        forwardComment:
          '(Body lagt på ved forwarding)',
      })
    }
  })
})
