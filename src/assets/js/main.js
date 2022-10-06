// main
(function() {
  const shareText = 'シェア機能のテスト送信です。';
  const shareUrl = 'https://latele-suzuki.github.io/test-to-share/';
  const encodedText = encodeURI(shareText);
  const encodedUrl = encodeURI(shareUrl);
  const shareTextAndUrl = `${encodedText}
${encodedUrl}`;

  document.querySelector('.share--fb').setAttribute('href', `http://www.facebook.com/share.php?u=${encodedUrl}`);
  document.querySelector('.share--tw').setAttribute('href', `https://twitter.com/share?url=${encodedUrl}&text=${encodedText}`);
  document.querySelector('.share--line').setAttribute('href', `https://line.me/R/share?text=${shareTextAndUrl}`);

  const head = document.getElementsByTagName('head')[0];
  const ogTitle = head.querySelector('meta[property="og:title"]');
  const ogDescription = head.querySelector('meta[property="og:description"]');
  const ogImg = head.querySelector('meta[property="og:image"]');
  ogTitle.content = '書き換えられたtitle';
  ogDescription.content = '書き換えられたdescription';
  ogImg.content = 'https://www.latele.co.jp/assets/img/share/ogp.jpg';
}());
