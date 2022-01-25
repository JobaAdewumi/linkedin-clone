import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

const httpMocks = require('node-mocks-http');

import { User } from './../../auth/models/user.class';

import { FeedService } from '../services/feed.service';
import { FeedPost } from '../models/post.interface';
import { FeedPostEntity } from '../models/post.entity';

describe('FeedService', () => {
  let feedService: FeedService;

  const mockRequest = httpMocks.createRequest();
  mockRequest.user = new User();
  mockRequest.user.firstName = 'Joba';

  const mockFeedPost: FeedPost = {
    body: 'body',
    createdAt: new Date(),
    author: mockRequest.user,
  };

  //   const mockFeedPosts: FeedPost[] = [
  //     mockFeedPost,
  //     { ...mockFeedPost, body: 'second feed post' },
  //     { ...mockFeedPost, body: 'third feed post' },
  //   ];

  //   const mockDeleteResult: DeleteResult = {
  //     raw: [],
  //     affected: 1,
  //   };

  //   const mockUpdateResult: UpdateResult = {
  //     ...mockDeleteResult,
  //     generatedMaps: [],
  //   };

  const mockFeedPostRepository = {
    createPost: jest
      .fn()
      .mockImplementation((user: User, feedPost: FeedPost) => {
        return {
          ...feedPost,
          author: User,
        };
      }),
    save: jest
      .fn()
      .mockImplementation((feedPost: FeedPost) =>
        Promise.resolve({ id: 1, ...feedPost }),
      ),
    // findPosts: jest
    //   .fn()
    //   .mockImplementation((numberToTake: number = 10, numberToSkip: number) => {
    //     const feedPostsAfterSkipping = mockFeedPosts.slice(numberToSkip);
    //     const filteredFeedPost = feedPostsAfterSkipping.slice(0, numberToTake);
    //     return filteredFeedPost;
    //   }),

    // updatePost: jest.fn().mockImplementation(() => {
    //   return mockUpdateResult;
    // }),
    // deletePost: jest.fn().mockImplementation(() => {
    //   return mockDeleteResult;
    // }),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FeedService,
        {
          provide: getRepositoryToken(FeedPostEntity),
          useValue: mockFeedPostRepository,
        },
      ],
    }).compile();

    feedService = moduleRef.get<FeedService>(FeedService);
  });

  it('should be defined', () => {
    expect(feedService).toBeDefined;
  });

  it('should create a post', (done: jest.DoneCallback) => {
    feedService
      .createPost(mockRequest.user, mockFeedPost)
      .subscribe((feedPost: FeedPost) => {
        expect(feedPost).toEqual({
          id: expect.any(Number),
          ...mockFeedPost,
        });
        done();
      });
  });
});
