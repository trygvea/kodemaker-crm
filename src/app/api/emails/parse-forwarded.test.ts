import { parseForwardedMessages } from './parse-forwarded'

describe('parseForwardedMessage', () => {
  it('parses a simple forwarded block with headers and body', () => {
    const body = `
Hello,

---------- Forwarded message ---------
From: Hanna Høiness <hanna.hoiness@gmail.com>
Date: Thu, 12 Sep 2025 10:42:00 +0200
Subject: Test
To: you@example.com

This is the original forwarded body.
`

    const parsed = parseForwardedMessages(body)
    expect(parsed).not.toBeNull()
    expect(parsed.length).toBeGreaterThan(0)

    const result = parsed[0]
      ? [{
          headers: {
            from: parsed[0].headers.from,
            date: parsed[0].headers.date,
            subject: parsed[0].headers.subject,
            to: parsed[0].headers.to,
          },
          body: parsed[0].body,
        }]
      : []

    expect(result).toEqual([
      {
        headers: {
          from: 'Hanna Høiness <hanna.hoiness@gmail.com>',
          date: 'Thu, 12 Sep 2025 10:42:00 +0200',
          subject: 'Test',
          to: 'you@example.com',
        },
        body: 'This is the original forwarded body.',
      },
    ])
  })
})


