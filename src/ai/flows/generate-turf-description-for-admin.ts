'use server';
/**
 * @fileOverview An AI agent that generates compelling marketing descriptions for sports turfs.
 *
 * - generateTurfDescriptionForAdmin - A function that handles the generation of turf descriptions.
 * - GenerateTurfDescriptionForAdminInput - The input type for the generateTurfDescriptionForAdmin function.
 * - GenerateTurfDescriptionForAdminOutput - The return type for the generateTurfDescriptionForAdmin function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTurfDescriptionForAdminInputSchema = z.object({
  turfName: z.string().describe('The name of the sports turf.'),
  location: z.string().describe('The location or area of the turf (e.g., Mysuru, Karnataka).'),
  sportTypes: z
    .array(z.enum(['Cricket', 'Football']))
    .describe('The types of sports supported by the turf.'),
  pricePerHour: z.number().describe('The price per hour for booking the turf.'),
  amenities: z
    .array(z.string())
    .describe('A list of amenities available at the turf (e.g., floodlights, changing rooms, parking, scoreboard).'),
  uniqueFeatures: z
    .string()
    .optional()
    .describe('Any additional unique features or selling points of the turf.'),
});
export type GenerateTurfDescriptionForAdminInput = z.infer<
  typeof GenerateTurfDescriptionForAdminInputSchema
>;

const GenerateTurfDescriptionForAdminOutputSchema = z.object({
  description: z.string().describe('A compelling marketing description for the turf.'),
});
export type GenerateTurfDescriptionForAdminOutput = z.infer<
  typeof GenerateTurfDescriptionForAdminOutputSchema
>;

export async function generateTurfDescriptionForAdmin(
  input: GenerateTurfDescriptionForAdminInput
): Promise<GenerateTurfDescriptionForAdminOutput> {
  return generateTurfDescriptionForAdminFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTurfDescriptionForAdminPrompt',
  input: {schema: GenerateTurfDescriptionForAdminInputSchema},
  output: {schema: GenerateTurfDescriptionForAdminOutputSchema},
  prompt: `You are a professional marketing copywriter for Turfista, a premium dark-themed sports turf discovery web app.
Your goal is to create compelling and detailed marketing descriptions for new turf listings.
Highlight the turf's features, amenities, and suitability for specific sports.
Emphasize the premium feel of Turfista with its neon green accents.
Encourage users to book the turf.

Generate a marketing description for the following turf:

Turf Name: {{{turfName}}}
Location: {{{location}}}
Sport Types: {{#each sportTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Price Per Hour: ₹{{{pricePerHour}}}
Amenities: {{#each amenities}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{#if uniqueFeatures}}Unique Features: {{{uniqueFeatures}}}{{/if}}

Create a description that is engaging and informs potential customers about the best aspects of this turf.`,
});

const generateTurfDescriptionForAdminFlow = ai.defineFlow(
  {
    name: 'generateTurfDescriptionForAdminFlow',
    inputSchema: GenerateTurfDescriptionForAdminInputSchema,
    outputSchema: GenerateTurfDescriptionForAdminOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
