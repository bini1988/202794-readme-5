import { Prisma } from '@prisma/client';
import { IPagination } from '@project/libs/shared/types';
import { PostgresRepository } from '@project/libs/shared/core';
import { IPostsFilters, getPostsFilters } from './posts.filters';
import { CreatePostDto } from './posts.dto/create-post.dto';
import { UpdatePostDto } from './posts.dto/update-post.dto';
import { RepostPostDto } from './posts.dto/repost-post.dto';
import { Post } from './post.entity';

export class PostsRepository extends PostgresRepository<Post> {
  public async findAll(filters?: IPostsFilters): Promise<IPagination<Post>> {
    const { take, skip, where, orderBy } = getPostsFilters(filters);
    const _count = { select: { comments: true, likes: true } };

    const [items, count] = await this.client.$transaction([
      this.client.post.findMany({
        include: { _count, tags: true },
        take, skip, where, orderBy,
      }),
      this.client.post.count({
        where, orderBy,
      }),
    ]);

    return {
      count: count,
      items: items,
      limit: filters?.limit,
      offset: filters?.offset,
      page: filters?.page,
      pages: Math.ceil(count / take),
    };
  }

  public async findOne(id: string): Promise<Post> {
    const _count = { select: { comments: true, likes: true } };

    return this.client.post.findUnique({
      include: { _count, tags: true },
      where: { id },
    });
  }

  public async create(dto: CreatePostDto): Promise<Post> {
    const _count = { select: { comments: true, likes: true } };
    const author = { id: dto.authorId };

    return this.client.post.create({
      data: {
        postType: dto.postType,
        payload: dto.payload as Prisma.JsonObject,
        author: { connectOrCreate: { where: author, create: author } },
        tags: { connectOrCreate: dto.taggedBy.map(tag => ({
          where: { text: tag }, create: { text: tag }
        })) },
      },
      include: { _count, tags: true },
    });
  }

  public async repost(dto: RepostPostDto): Promise<Post> {
    const post = await this.findOne(dto.postId);

    if (!post) {
      return;
    }
    const _count = { select: { comments: true, likes: true } };
    const author = { id: dto.authorId };

    return this.client.post.create({
      data: {
        postType: post.postType,
        payload: post.payload as Prisma.JsonObject,
        author: { connectOrCreate: { where: author, create: author } },
        owner: { connect: { id: post.authorId } },
        ownerPost: { connect: { id: post.id } },
        tags: { connect: post.tags },
        reposted: true,
      },
      include: { _count, tags: true },
    });
  }

  public async update(id: string, dto: UpdatePostDto): Promise<Post> {
    const _count = { select: { comments: true, likes: true } };

    return this.client.post.update({
      data: {
        postType: dto.postType,
        payload: dto.payload as Prisma.JsonObject,
      },
      include: { _count, tags: true },
      where: { id },
    });
  }

  public async remove(id: string): Promise<Post> {
    const _count = { select: { comments: true, likes: true } };

    return this.client.post.delete({
      include: { _count, tags: true },
      where: { id },
    });
  }
}
