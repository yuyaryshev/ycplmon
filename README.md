# ycplmon

This tool is used to create unique CPLs (**C**ode-**P**lace-**L**ocators) across your source code.

CPL is string like `CODEnnnnnnnn` it can be part of other string.

# Why

It's just a very fast and convenient way for me to find where some error message or log message was emited.

Without this when you see 'Failed to open XXXX file' you will then waste some time to find out where is the code which opens file.

But when you see 'CODEXXXXXXXX Failed to open XXXX file' you just search for 'CODEXXXXXXXX' in all your git project and instantly know where it was opened.

You can do that instantly even if the user sends you screenshot and you can't just copy-and-paste your error message.

## Installation

```
npm i -g ycplmon
yarn add -g ycplmon
pnpm i -g ycplmon
```



## How this works:

- Suppouse all your code is in "src" folder

- Anywhere in your code write `CODEnnnnnnnn `where `nnnnnnnn`- are any 8 digits

- run "`ycplmon fix src`" or "`ycplmon2 fix src`"

- This command replaces all non-unique CPLS with unique ones. Now all this tags will have unique codes

- Now log this CPLs, print them or save to DB

- And when you want to find the code that emmited them - just search through all your code base for specific CPL.

## Tips and tricks

- If you want to generate some files use ``CODE${'00000000'}\` ` .
