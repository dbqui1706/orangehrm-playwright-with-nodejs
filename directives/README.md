# Directives

This directory contains **SOPs (Standard Operating Procedures)** written in Markdown. Each directive defines:

- **Goal**: What you're trying to accomplish
- **Inputs**: What data/parameters are needed
- **Tools**: Which execution scripts to use
- **Outputs**: What the result should look like
- **Edge Cases**: Common errors and how to handle them

## Purpose

Directives are natural language instructions that tell the AI orchestration layer (Layer 2) what to do. They're like instructions you'd give to a mid-level employee—clear, specific, and actionable.

## Structure

Use the `_template.md` file as a starting point for new directives. Each directive should follow this format:

```markdown
# [Directive Name]

## Goal
What this directive accomplishes

## Inputs
- Input 1: description
- Input 2: description

## Tools/Scripts
- `execution/script_name.ts`: what it does

## Outputs
What gets produced (files, data, deliverables)

## Edge Cases
- Common error 1: how to handle
- Common error 2: how to handle

## Notes
Any additional context, API limits, timing expectations, etc.
```

## Best Practices

1. **Be specific**: Don't say "scrape website", say "scrape product listings from e-commerce site and extract name, price, image URL"
2. **Update as you learn**: When you discover API constraints, better approaches, or common errors, update the directive
3. **One directive per workflow**: Each directive should represent a complete, standalone workflow
4. **Living documents**: Directives improve over time as the system learns

## Examples

- `scrape_website.md` - How to scrape a single website
- `generate_report.md` - How to compile data into a Google Sheet
- `send_email.md` - How to send automated emails
