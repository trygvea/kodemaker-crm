import EmailReplyParser from "email-reply-parser";

export interface ForwardedMessage {
  headers: {
    from?: string;
    date?: string;
    subject?: string;
    to?: string;
  };
  body: string;
}

/**
 * Parse forwarded sections from an email body and extract headers + body.
 */
export function parseForwardedMessages(bodyText: string): ForwardedMessage[] {
  // Pre-process with email-reply-parser to normalize content (drop signatures/hidden quoted noise)
  try {
    const mail = new EmailReplyParser().read(bodyText);
    const visible = mail.fragments
      .filter((f: any) => !f.getHidden())
      .map((f: any) => f.getContent())
      .join("\n");
    bodyText = visible || bodyText;
  } catch {
    // If parser fails, fall back to raw body
  }

  const MARKERS: RegExp[] = [
    /^[-\s]*forwarded message[-\s]*$/im,
    /^begin forwarded message:?$/im,
    /^[-]{2,}\s*forwarded message\s*[-]{2,}\s*$/im,
    /^[-\s]*videresendt melding[-\s]*$/im,
    /^begynn videresendt melding:?$/im,
    /^[-]{2,}\s*videresendt melding\s*[-]{2,}\s*$/im,
  ];

  // Find all marker start indices
  const starts: number[] = [];
  for (const re of MARKERS) {
    let m: RegExpExecArray | null;
    const r = new RegExp(re.source, re.flags.replace("g", "") + "g");
    while ((m = r.exec(bodyText))) starts.push(m.index);
  }
  // Unique & sorted
  const uniqueStarts = Array.from(new Set(starts)).sort((a, b) => a - b);

  const blocks: string[] = [];
  if (uniqueStarts.length === 0) {
    // If no explicit marker, try a heuristic: a header cluster beginning with From:
    const hdrStart = bodyText.search(/^(from|fra):\s*/im);
    if (hdrStart !== -1) blocks.push(bodyText.slice(hdrStart));
  } else {
    for (let i = 0; i < uniqueStarts.length; i++) {
      const start = uniqueStarts[i];
      const end =
        i + 1 < uniqueStarts.length ? uniqueStarts[i + 1] : bodyText.length;
      blocks.push(bodyText.slice(start, end));
    }
  }

  const results: ForwardedMessage[] = [];

  for (const block of blocks) {
    const lines = block.split(/\r?\n/);
    let i = 0;
    // Skip initial marker line
    if (MARKERS.some((re) => re.test(lines[i] ?? ""))) i++;

    // Collect header lines until a blank line
    const headerLines: string[] = [];
    for (; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) {
        i++;
        break;
      }
      headerLines.push(line);
    }
    if (headerLines.length === 0) continue;

    // Unfold (continuation lines start with space or tab)
    const unfolded: string[] = [];
    for (const line of headerLines) {
      if (/^[ \t]/.test(line) && unfolded.length) {
        unfolded[unfolded.length - 1] += " " + line.trim();
      } else {
        unfolded.push(line);
      }
    }

    // Parse key:value headers into a map (lowercased keys)
    const all: Record<string, string> = {};
    for (const h of unfolded) {
      const m = h.match(/^([^:]+):\s*(.*)$/);
      if (!m) continue;
      const key = m[1].trim().toLowerCase();
      const val = m[2].trim();
      all[key] = all[key] ? `${all[key]}, ${val}` : val;
    }

    const headers = {
      from: all["from"],
      date: all["date"],
      subject: all["subject"],
      to: all["to"],
    };

    const body = lines.slice(i).join("\n").trim();
    results.push({ headers, body });
  }

  return results;
}
