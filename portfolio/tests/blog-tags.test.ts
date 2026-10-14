/**
 * Blog card chips come from the Notion Blog Entries "Tags" property.
 * Search matches those tags. A fresh pull includes tags that only appear on a new post.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Client } from "@notionhq/client";
import { ProjectSearch } from "../components/project-search";
import { collectTags, postsMatching } from "../lib/blog-tags";
import { getBlogDataSourceId, getNotionIntegrationToken } from "../lib/notion/config";
import { fetchPublishedPosts, type ProjectPost } from "../lib/notion/posts";
import { pageTags } from "../lib/notion/properties";

function post(partial: Partial<ProjectPost> & Pick<ProjectPost, "id" | "slug" | "title">): ProjectPost {
  return {
    excerpt: "",
    tags: [],
    seoTitle: partial.title,
    ...partial,
  };
}

describe("blog card tags", () => {
  it("shows the post's Notion tags on the card and not the problem taxonomy", () => {
    const html = renderToStaticMarkup(
      createElement(ProjectSearch, {
        posts: [
          post({
            id: "1",
            slug: "hack-for-racial-justice-2020",
            title: "Hack for Racial Justice",
            tags: ["Census data", "Community research"],
          }),
        ],
      }),
    );

    assert.match(html, /Census data/);
    assert.match(html, /Community research/);
    assert.doesNotMatch(html, /Discovery &amp; solution design|Discovery & solution design/);
    assert.doesNotMatch(html, /First-of-kind architecture/);
  });

  it("omits the tag row when the post has no Notion tags", () => {
    const html = renderToStaticMarkup(
      createElement(ProjectSearch, {
        posts: [
          post({
            id: "1",
            slug: "hack-for-racial-justice-2020",
            title: "Hack for Racial Justice",
            tags: [],
          }),
        ],
      }),
    );

    assert.doesNotMatch(html, /problem-row/);
    assert.doesNotMatch(html, /Discovery &amp; solution design|Discovery & solution design/);
  });
});

describe("tag catalog and search", () => {
  const existing = post({
    id: "old",
    slug: "auto-note",
    title: "Auto-Note",
    tags: ["Clinical notes"],
  });
  const added = post({
    id: "new",
    slug: "new-post",
    title: "A new deep dive",
    tags: ["Sailing"],
  });

  it("includes a tag that appears only on a newly pulled post", () => {
    assert.deepEqual(collectTags([existing]), ["Clinical notes"]);
    assert.deepEqual(collectTags([existing, added]).sort(), ["Clinical notes", "Sailing"]);
  });

  it("searching by a tag returns only posts that have that tag", () => {
    const posts = [existing, added];
    assert.deepEqual(
      postsMatching(posts, "sailing").map((item) => item.slug),
      ["new-post"],
    );
    assert.deepEqual(
      postsMatching(posts, "clinical").map((item) => item.slug),
      ["auto-note"],
    );
    assert.deepEqual(postsMatching(posts, "not-a-tag"), []);
  });
});

describe("Notion Blog Entries Tags property", () => {
  it("exists on the database and published posts return its values", async () => {
    const token = getNotionIntegrationToken();
    const dataSourceId = getBlogDataSourceId();
    assert.ok(token, "NOTION_TOKEN is set");
    assert.ok(dataSourceId, "NOTION_BLOG_DATA_SOURCE_ID is set");

    const notion = new Client({ auth: token });
    const source = await notion.dataSources.retrieve({ data_source_id: dataSourceId });
    const tagsProperty = source.properties.Tags;
    assert.ok(tagsProperty, "Blog Entries has a Tags property");
    assert.equal(tagsProperty.type, "multi_select");

    const posts = await fetchPublishedPosts();
    assert.ok(posts.length > 0, "at least one published post");

    for (const item of posts) {
      const match = await notion.pages.retrieve({ page_id: item.id });
      assert.ok("properties" in match);
      const fromProperty = pageTags(match);
      assert.deepEqual(item.tags, fromProperty);

      for (const tag of item.tags) {
        assert.ok(
          postsMatching(posts, tag).some((post) => post.id === item.id),
          `searching “${tag}” includes ${item.slug}`,
        );
      }
    }

    const catalog = collectTags(posts);
    for (const tag of posts.flatMap((item) => item.tags)) {
      assert.ok(catalog.includes(tag), `pull catalog includes “${tag}”`);
    }
  });
});
