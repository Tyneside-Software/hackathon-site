# Desk

The integrator session is the one Michael talks to. It uses the checkouts in `C:\Users\MichaelThomson\source\hackathon-site` and the two sibling repos. The other sessions are not running until Michael pastes a line into each one.

Orders and replies stay in files on this PC, next to the lane clones. They are not in git, so a lane sees a new order without a pull, and a note cannot be deployed by mistake. Do not put the SSH password, or anything from `C:\Users\MichaelThomson\Desktop\confidential docs`, in a desk file.

| Lane | Read this | Overwrite this when you finish |
|------|-----------|--------------------------------|
| Product owner | `C:\Users\MichaelThomson\source\lanes\desk\to-po.md` | `C:\Users\MichaelThomson\source\lanes\desk\from-po.md` |
| grok-dev-1 | `C:\Users\MichaelThomson\source\lanes\desk\to-grok-dev-1.md` | `C:\Users\MichaelThomson\source\lanes\desk\from-grok-dev-1.md` |
| grok-dev-2 | `C:\Users\MichaelThomson\source\lanes\desk\to-grok-dev-2.md` | `C:\Users\MichaelThomson\source\lanes\desk\from-grok-dev-2.md` |

The line Michael pastes does not change. The integrator rewrites the `to-` file, and Michael pastes the same line to wake that lane. Each lane also follows its `PROMPT.md` and [Lanes](#lanes).

A reply says what was done, what is blocked, any pull request URL, and what the integrator should do next. One lane does not edit another lane's file.

The same three paste lines are in [Lanes](#lanes).
