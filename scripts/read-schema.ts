// prints the content collection frontmatter fields as JSON: [{ name, required }, ...]
// in schema declaration order. scripts/create.sh shells out to this so the
// scaffolded frontmatter always matches src/schemas/contentSchema.ts.
import { baseSchema } from "../src/schemas/contentSchema.ts";

const fields = Object.entries(baseSchema.shape).map(([name, field]) => ({
    name,
    required: !field.safeParse(undefined).success,
}));

console.log(JSON.stringify(fields));
