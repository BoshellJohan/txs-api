import bcrypt from "bcryptjs";
import { tracer } from "../common/tracer.js";
import { SpanStatusCode } from "@opentelemetry/api";

export async function hashString(str: string){
    return tracer.startActiveSpan('bcrypt.hash', async (span) => {
        try {
            return await bcrypt.hash(str, 10);
        } catch (error){
            if(error instanceof Error){
                span.recordException(error);
                span.setStatus({ code: SpanStatusCode.ERROR, message: error.message});
            } else {
                span.setStatus({ code: SpanStatusCode.ERROR, message: 'Error while hashing string'});
            }

            throw error;
        } finally {
            span.end();
        }
    });
}

export async function compareHashes(hash1: string, hash2: string) {
    return tracer.startActiveSpan('bcrypt.compare', async (span) => {
        try {
            return await bcrypt.compare(hash1, hash2);
        } catch (error) {
            if(error instanceof Error){
                span.recordException(error);
                span.setStatus({code: SpanStatusCode.ERROR, message: error.message});
            } else {
                span.setStatus({code: SpanStatusCode.ERROR, message: 'Error while comparing hashes'});
            }

            throw error;
        } finally {
            span.end();
        }
    }); 
}