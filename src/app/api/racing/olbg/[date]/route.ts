import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { OLBGRaceInfo, OLBGTip, OLBGTips } from "@/types/racing";
import * as cheerio from "cheerio";
import { cleanName } from "@/app/rp/utils/fetchRaceAccordion";
import { normalizeTime } from "@/components/horse/DayPredictions";

const CACHE_DIR = path.join(process.cwd(), "cache", "olbg");

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function fetchAndParseTips(
  date: string
): Promise<{ tips: OLBGTip[]; olbgRaceInfoArr: OLBGRaceInfo[] }> {
  const olbgRaceInfoArr: OLBGRaceInfo[] = [];

  console.log("🔍 Fetching OLBG tips...");
  const response = await fetch(
    "https://alexdawson.co.uk/getP.php?q=https://www.olbg.com/betting-tips/Horse_Racing/UK/2"
  );

  const responseIre = await fetch(
    "https://alexdawson.co.uk/getP.php?q=https://www.olbg.com/betting-tips/Horse_Racing/IE/2"
  );

  console.log("✅ Fetched OLBG page");

  const html = await response.text();
  const htmlIre = await responseIre.text();
  console.log("📄 Got HTML response");

  const $ = cheerio.load(html);
  const $Ire = cheerio.load(htmlIre);
  console.log("🔧 Loaded HTML into Cheerio");

  // Create a map to store aggregated tips by horse
  const tipsMap = new Map<
    string,
    {
      horseName: string;
      winTips: number;
      winTotal: number;
      winPerc: number;
      ewTips: number;
      ewTotal: number;
      ewPerc: number;
      napTips: number;
      napTotal: number;
      napPerc: number;
      expertCount: number;
      commentCount: number;
      comment?: string;
    }
  >();

  const allRacesOptions: { value: string; href: string }[] = [];
  const raceLinks: { value: string; href: string }[] = [];

  // Find the specific dropdown containing All Races options
  $(`[itemprop="itemListElement"]`).each((_, dropdown) => {
    const dropdownText = $(dropdown).find("a").text().trim();
    if (
      dropdownText.includes("All Races") &&
      !dropdownText.includes("Next Races")
    ) {
      $(dropdown)
        .find("li a")
        .each((_, link) => {
          const value = $(link).attr("title") || $(link).text().trim();
          const href = $(link).attr("href") || "";
          if (value && href && value !== "All Races") {
            allRacesOptions.push({
              value,
              href: `https://alexdawson.co.uk/getP.php?q=https://www.olbg.com/${href}`,
            });
          }
        });
    }
  });

  const limitedRacesOptions = allRacesOptions; //.slice(0, 1);

  console.log("📊 Found race options:", allRacesOptions);

  // Fetch content from each URL in allRacesOptions
  for (const option of limitedRacesOptions) {
    console.log(`🔍 Fetching content from: ${option.value}`);
    try {
      const raceResponse = await fetch(option.href);
      const raceHtml = await raceResponse.text();
      const $race = cheerio.load(raceHtml);

      // Find all .h-rst-lnk elements within the tipsListingContainer-Match div
      //console.log("🔍 raceHtml", raceHtml);
      $race(".tip .ev a").each((_, element) => {
        const time = $race(element).parent().find("time").attr("datetime");
        //console.log("🕒 Found time:", time);

        const timeIsSameDay =
          time &&
          new Date(time).toDateString() === new Date(date).toDateString();

        const value = $race(element).text().trim();
        const href = $race(element).attr("href") || "";
        //console.log("🔍 tip .ev a Value:", value);
        //console.log("🔍 tip .ev a Href:", href);
        if (!timeIsSameDay) {
          console.log("🔍 tip .ev a rejected as not the same day:", href, time);
          return;
        }
        if (value && href && timeIsSameDay) {
          console.log("🔍 tip .ev a push:", value);
          raceLinks.push({
            value,
            href: `https://alexdawson.co.uk/getP.php?q=https://www.olbg.com${href}`,
          });
        } else {
          console.log("🔍 tip .ev a rejected:", href);
        }
      });
    } catch (error) {
      console.error(`❌ Error fetching ${option.value}:`, error);
    }
  }
  console.log("🔍 raceLinks", raceLinks);
  $Ire(".tip .ev a").each((_, element) => {
    const value = $Ire(element).text().trim();
    const href = $Ire(element).attr("href") || "";
    if (value && href) {
      raceLinks.push({
        value,
        href: `https://alexdawson.co.uk/getP.php?q=https://www.olbg.com${href}`,
      });
    }
  });
  console.log("🔍 raceLinks", raceLinks);
  const uniqueUrls = [
    ...new Set(
      raceLinks.map((link) =>
        link.href?.replace(
          "https://www.olbg.comhttps://www.olbg.com/",
          "https://www.olbg.com/"
        )
      )
    ),
  ];
  console.log("🔍 uniqueUrls", uniqueUrls);
  //console.log("🔗 Unique URLs:", uniqueUrls);
  const filteredUrls = uniqueUrls.filter(
    (url) => !url.includes("https://www.olbg.comhttps://www.olbg.com/")
  );
  console.log("🔍 filteredUrls", filteredUrls);
  //console.log("🔗 Filtered URLs:", filteredUrls);
  const limitedFilteredUrls = filteredUrls; //.slice(0, 1);
  console.log("🔗 Race URLs:", limitedFilteredUrls);

  // Fetch content from each URL and parse tips
  for (const url of limitedFilteredUrls) {
    console.log("🔍 Fetching content from:", url);
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 5000 + Math.floor(Math.random() * 5000))
      );
      const lilNameArr: string[] = [];
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);

      // Find the eventsListingContainer
      const eventsContainer = $(".l-list");

      //console.log("🔍 Events container:", eventsContainer);
      if (!eventsContainer.length) continue;

      // Find all tip elements
      eventsContainer.find("a.grd.block").each((_, tipElement) => {
        const $tip = $(tipElement);

        // Extract horse name
        const horseName = cleanName($tip.find(".rw.slct h4").text().trim());
        if (!horseName) return;

        lilNameArr.push(horseName);

        // Get or create horse entry in map
        const horseEntry = tipsMap.get(horseName) || {
          horseName,
          winTips: 0,
          winTotal: 0,
          winPerc: 0,
          ewTips: 0,
          ewTotal: 0,
          ewPerc: 0,
          napTips: 0,
          napTotal: 0,
          napPerc: 0,
          expertCount: 0,
          commentCount: 0,
        };

        // Extract win tips count and total
        const winTipsText = $tip.find(".rw.win b").text();
        const winTipsMatch = winTipsText.match(/(\d+)\s*\/\s*(\d+)*/i);
        if (winTipsMatch) {
          horseEntry.winTips = parseInt(winTipsMatch[1]);
          horseEntry.winTotal = parseInt(winTipsMatch[2]);
          horseEntry.winPerc =
            horseEntry.winTotal > 0
              ? Math.round((horseEntry.winTips / horseEntry.winTotal) * 100)
              : 0;
        }

        // Extract EW tips count and total
        const ewTipsText = $tip.find(".rw.ew b").text();
        const ewTipsMatch = ewTipsText.match(/(\d+)\s*\/\s*(\d+)*/i);
        if (ewTipsMatch) {
          horseEntry.ewTips = parseInt(ewTipsMatch[1]);
          horseEntry.ewTotal = parseInt(ewTipsMatch[2]);
          horseEntry.ewPerc =
            horseEntry.ewTotal > 0
              ? Math.round((horseEntry.ewTips / horseEntry.ewTotal) * 100)
              : 0;
        }

        // Extract NAP tips count and total
        const napTipsText = $tip.find(".rw.nap b").text();
        const napTipsMatch = napTipsText.match(/(\d+)\s*\/\s*(\d+)*/i);
        if (napTipsMatch) {
          horseEntry.napTips = parseInt(napTipsMatch[1]);
          horseEntry.napTotal = parseInt(napTipsMatch[2]);
          horseEntry.napPerc =
            horseEntry.napTotal > 0
              ? Math.round((horseEntry.napTips / horseEntry.napTotal) * 100)
              : 0;
        }

        // Extract expert count
        const expertCount = parseInt(
          $tip
            .find(".rw.win .i-ui-crown")
            .parent()
            .text()
            .match(/(\d+)/)?.[1] || "0"
        );
        horseEntry.expertCount = expertCount;

        // Extract comment count
        const commentCount = parseInt(
          $tip
            .find(".rw.win .i-ui-comments")
            .parent()
            .text()
            .match(/(\d+)/)?.[1] || "0"
        );
        horseEntry.commentCount = commentCount;

        // Extract comment text if there are comments
        if (commentCount > 0) {
          //console.log("🔍 Comment count:", commentCount);
          //console.log("🔍 Tip element:", $tip.html());
          const nextElement = $tip.next();
          //console.log("🔍 Next element:", nextElement.html());
          const nextElementHtml = nextElement.html() || "";
          const $nextElement = cheerio.load(nextElementHtml);
          const commentElement = $nextElement(`[role="tooltip"] p`);
          const comment = commentElement.text().trim();

          // console.log("🔍 Comment element:", commentElement.html());
          // console.log("🔍 Raw comment text:", commentElement.text());
          // console.log("🔍 Trimmed comment:", comment);
          // console.log("🔍 Comment:", comment);
          if (comment) {
            horseEntry.comment = comment;
          }
        }

        tipsMap.set(horseName, horseEntry);
      });

      const trackAndTime = url.split("/").slice(-2)[0];
      const trackAndTimeSplit = trackAndTime.split("_");
      const time = normalizeTime(trackAndTimeSplit[0]);
      const trackName = trackAndTimeSplit[1];

      const olbgRaceInfoObj: OLBGRaceInfo = {
        date,
        trackAndTime,
        track: trackName,
        names: lilNameArr,
        count: lilNameArr.length,
        url,
        time,
      };
      olbgRaceInfoArr.push(olbgRaceInfoObj);

      console.log("🔍 Fetched:", url);
    } catch (error) {
      console.error(`Error fetching tips from ${url}:`, error);
    }
  }

  // Convert map to array of tips
  const tips: OLBGTip[] = Array.from(tipsMap.values()).map((entry) => ({
    horseName: entry.horseName,
    winTips: entry.winTips,
    winTotal: entry.winTotal,
    winPerc: entry.winPerc,
    ewTips: entry.ewTips,
    ewTotal: entry.ewTotal,
    ewPerc: entry.ewPerc,
    napTips: entry.napTips,
    napTotal: entry.napTotal,
    napPerc: entry.napPerc,
    expertCount: entry.expertCount,
    commentCount: entry.commentCount,
    comment: entry.comment,
  }));

  //console.log("🔗 Total race links found:", raceLinks.length);
  //console.log("🔗 Race Links:", raceLinks);
  //console.log("🔗 Unique URLs:", uniqueUrls);
  console.log("🔗 Filtered URLs:", filteredUrls);
  //console.log("✨ Parsed tips:", tips);

  return { tips, olbgRaceInfoArr };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  const date = await Promise.resolve(params.date);

  const cacheFile = path.join(CACHE_DIR, `${date}.json`);
  try {
    // Try to read from cache first
    const cachedData = await fs.readFile(cacheFile, "utf-8");
    return NextResponse.json(JSON.parse(cachedData));
  } catch {
    if (date) {
      const { tips, olbgRaceInfoArr } = await fetchAndParseTips(params.date);

      const olbgTips: OLBGTips = {
        date,
        tips,
        olbgRaceInfoArr,
      };

      //Save to cache
      await ensureDirectoryExists(CACHE_DIR);
      await fs.writeFile(cacheFile, JSON.stringify(olbgTips, null, 2));

      // Also save to next day's cache file if it doesn't exist
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextDateString = nextDate.toISOString().split("T")[0];
      const nextCacheFile = path.join(CACHE_DIR, `${nextDateString}.json`);

      try {
        await fs.access(nextCacheFile);
      } catch {
        // Next day's file doesn't exist, so create it
        await fs.writeFile(nextCacheFile, JSON.stringify(olbgTips, null, 2));
      }

      return NextResponse.json(olbgTips);
    }

    return NextResponse.json({
      date,
      tips: [],
      olbgRaceInfoArr: [],
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  const date = await Promise.resolve(params.date);
  const cacheFile = path.join(CACHE_DIR, `${date}.json`);

  try {
    await fs.unlink(cacheFile);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting OLBG data:", error);
    return NextResponse.json(
      { error: "Failed to delete OLBG data" },
      { status: 500 }
    );
  }
}
