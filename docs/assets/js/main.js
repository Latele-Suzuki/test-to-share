!function(){const e=encodeURI("シェア機能のテスト送信です。"),t=encodeURI("https://latele-suzuki.github.io/test-to-share/"),r=`${e}\n${t}`;document.querySelector(".share--fb").setAttribute("href",`http://www.facebook.com/share.php?u=${t}`),document.querySelector(".share--tw").setAttribute("href",`https://twitter.com/share?url=${t}&text=${e}`),document.querySelector(".share--line").setAttribute("href",`https://line.me/R/share?text=${r}`);const o=document.getElementsByTagName("head")[0],n=document.getElementsByTagName("title")[0],c=o.querySelector('meta[name="description"]'),s=o.querySelector('meta[property="og:title"]'),i=o.querySelector('meta[property="og:description"]'),a=o.querySelector('meta[property="og:image"]');s.content="書き換えられたtitle",i.content="書き換えられたdescription",a.content="https://www.latele.co.jp/assets/img/share/ogp.jpg",n.innerText="書き換えられたtitle",c.content="書き換えられたdescription"}();