import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isAllowedHttpUrl,
  isBlockedHostname,
  isPrivateIpAddress,
  isPrivateIpv4,
  isPrivateIpv6,
  parseHttpUrl,
  UnsafeUrlError,
} from "./url-safety-shared.ts";

describe("url-safety-shared", () => {
  it("blocks loopback and private IPv4 literals", () => {
    assert.equal(isPrivateIpv4("127.0.0.1"), true);
    assert.equal(isPrivateIpv4("10.0.0.5"), true);
    assert.equal(isPrivateIpv4("192.168.1.1"), true);
    assert.equal(isPrivateIpv4("172.16.0.1"), true);
    assert.equal(isPrivateIpv4("169.254.169.254"), true);
    assert.equal(isPrivateIpv4("100.64.1.2"), true);
    assert.equal(isPrivateIpv4("8.8.8.8"), false);
  });

  it("blocks loopback, ULA, and mapped private IPv6 literals", () => {
    assert.equal(isPrivateIpv6("::1"), true);
    assert.equal(isPrivateIpv6("fe80::1"), true);
    assert.equal(isPrivateIpv6("fd12::1"), true);
    assert.equal(isPrivateIpv6("::ffff:127.0.0.1"), true);
    assert.equal(isPrivateIpv6("::ffff:c0a8:0001"), true);
    assert.equal(isPrivateIpAddress("2001:4860:4860::8888"), false);
  });

  it("blocks localhost-style hostnames", () => {
    assert.equal(isBlockedHostname("localhost"), true);
    assert.equal(isBlockedHostname("foo.localhost"), true);
    assert.equal(isBlockedHostname("metadata.google.internal"), true);
    assert.equal(isBlockedHostname("example.com"), false);
  });

  it("rejects non-http schemes and credentialed URLs", () => {
    assert.equal(isAllowedHttpUrl("file:///etc/passwd"), false);
    assert.equal(isAllowedHttpUrl("ftp://example.com/a.m3u"), false);
    assert.equal(isAllowedHttpUrl("https://user:pass@example.com/a.m3u"), false);
    assert.equal(isAllowedHttpUrl("https://example.com/playlist.m3u"), true);
    assert.equal(isAllowedHttpUrl("http://127.0.0.1/secret"), false);
  });

  it("parseHttpUrl throws UnsafeUrlError for private targets", () => {
    assert.throws(() => parseHttpUrl("http://192.168.0.10/x"), UnsafeUrlError);
    assert.doesNotThrow(() => parseHttpUrl("https://cdn.example.com/live.m3u8"));
  });
});
