import React, { useState } from 'react';
import styled from 'styled-components';
import vkbeautify from 'vkbeautify';

const Converter: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [xmlData, setXmlData] = useState<string>('');
  const [rssData, setRssData] = useState<string>('');
  const [showError, setShowError] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState<boolean>(false);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    setShowError(false);
  };

  const fetchXml = async () => {
    if (!url) {
      return;
    }

    setShowLoader(true);
    try {
      const response = await fetch(
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      );
      const data = await response.text();
      setXmlData(data);
      setShowError(false);
      convertToRss(data);
    } catch (error) {
      console.error(error);
      setShowError(true);
    } finally {
      setShowLoader(false);
    }
  };

  const convertToRss = (xml: string) => {
    const parser = new DOMParser();
    const currentDoc = parser.parseFromString(xml, 'application/xml');
    const updatedDoc = document.implementation.createDocument('', '', null);
    const rss = updatedDoc.createElement('rss');
    rss.setAttribute('xmlns:media', 'http://search.yahoo.com/mrss/');
    rss.setAttribute('xmlns:atom', 'http://www.w3.org/2005/Atom');
    rss.setAttribute('xmlns:dc', 'http://purl.org/dc/elements/1.1/');
    rss.setAttribute('version', '2.0');

    const channel = updatedDoc.createElement('channel');
    rss.appendChild(channel);

    const title = updatedDoc.createElement('title');
    title.innerHTML = currentDoc.querySelector('feed > title')?.innerHTML || '';
    channel.appendChild(title);

    const description = updatedDoc.createElement('description');
    description.innerHTML =
      currentDoc.querySelector('feed > description')?.innerHTML || '';
    channel.appendChild(description);

    const pubDate = updatedDoc.createElement('pubDate');
    pubDate.innerHTML =
      currentDoc.querySelector('feed > updated')?.innerHTML || '';
    channel.appendChild(pubDate);

    const link = updatedDoc.createElement('link');
    link.innerHTML =
      currentDoc
        .querySelector('feed > link[rel="self"]')
        ?.getAttribute('href') ||
      currentDoc.querySelector('feed > link')?.getAttribute('href') ||
      '';
    channel.appendChild(link);

    const author = updatedDoc.createElement('author');
    author.innerHTML =
      currentDoc.querySelector('feed > author > name')?.innerHTML || '';
    channel.appendChild(author);

    const entries = currentDoc.querySelectorAll('feed > entry');
    entries.forEach((entry) => {
      const item = updatedDoc.createElement('item');

      const title = updatedDoc.createElement('title');
      title.innerHTML = entry.querySelector('title')?.innerHTML || '';
      item.appendChild(title);

      const link = updatedDoc.createElement('link');
      link.innerHTML = entry.querySelector('link')?.getAttribute('href') || '';
      item.appendChild(link);

      const creator = updatedDoc.createElement('dc:creator');
      creator.innerHTML = entry.querySelector('author > name')?.innerHTML || '';
      item.appendChild(creator);

      const pubDate = updatedDoc.createElement('pubDate');
      const date = entry.querySelector('published')?.innerHTML;
      if (date) {
        const originalDate = new Date(date);

        const options = {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
        };

        const convertedDate = originalDate.toLocaleString(
          'en-US',
          options as Intl.DateTimeFormatOptions,
        );

        pubDate.innerHTML = convertedDate;
      } else {
        pubDate.innerHTML = '';
      }
      item.appendChild(pubDate);

      const description = updatedDoc.createElement('description');
      description.innerHTML = entry.querySelector('content')?.innerHTML || '';
      item.appendChild(description);

      channel.appendChild(item);
    });

    rss.appendChild(channel);
    updatedDoc.appendChild(rss);

    const rssData = vkbeautify.xml(new XMLSerializer().serializeToString(rss));
    setRssData(rssData);
  };

  const downloadRssFile = () => {
    const element = document.createElement('a');
    const file = new Blob([rssData], { type: 'text/xml' });
    element.href = URL.createObjectURL(file);
    element.download = 'rss-feed.xml';
    document.body.appendChild(element);
    element.click();
  };

  return (
    <Container>
      <InputContainer>
        <InputWithLoader>
          {showLoader && <Loader />}
          <Input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="URL XML feed"
          />
        </InputWithLoader>
        <Button onClick={fetchXml}>Upload XML</Button>
      </InputContainer>

      {showError && <Error>Error while loading XML</Error>}

      <OutputContainer>
        <Preview>
          <Title>Feed Preview</Title>
          <TextArea value={xmlData} readOnly />
        </Preview>

        <Preview>
          <Title>RSS Preview</Title>
          <ActionButton onClick={downloadRssFile}>Download RSS</ActionButton>
          <TextArea value={rssData} readOnly />
        </Preview>
      </OutputContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const InputContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 8px;
  width: 100%;
`;

const Title = styled.h3`
  margin: 0 0 20px 0;
  padding: 0;
  font-size: 32px;
  font-weight: bold;
`;

const Button = styled.button`
  padding: 10px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 2px;
  cursor: pointer;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 50vh;
  padding: 8px;
  margin-bottom: 10px;
  resize: none;
`;

const OutputContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
`;

const Preview = styled.div`
  width: 100%;
  position: relative;

  @media (min-width: 1200px) {
    width: calc(50% - 20px);
    margin-right: 20px;

    &:last-child {
      margin-right: 0;
      width: 50%;
    }
  }
`;

const Error = styled.h6`
  color: #ffffff;
  font-size: 16px;
  background-color: #ba0000;
  font-weight: bold;
  padding: 8px 16px;
  margin: 0 0 20px 0;
  border-radius: 2px;
`;

const ActionButton = styled(Button)`
  position: absolute;
  bottom: 0;
  right: 0;
  transform: translate(-3px, -50%);
`;

const Loader = styled.div`
  position: absolute;
  top: 5px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: 2px solid #000;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const InputWithLoader = styled.div`
  flex-grow: 1;
  margin-right: 10px;
  position: relative;
`;

export default Converter;
